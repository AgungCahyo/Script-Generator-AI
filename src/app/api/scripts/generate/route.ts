import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'
import { initializeGemini, getGeminiModel } from '@/lib/api/gemini'
import { buildSystemPrompt } from '@/lib/prompts/builders'
import { DEFAULT_MODEL } from '@/lib/constants/models'
import { extractKeywords } from '@/lib/utils/keywords'
import {
    DEFAULT_DURATION,
    DEFAULT_PLATFORM,
    DEFAULT_TONE,
    DEFAULT_FORMAT,
    DEFAULT_LANGUAGE,
    DEFAULT_HOOK_STYLE
} from '@/lib/constants/script-options'
import {
    DEFAULT_VOICE_TONE,
    DEFAULT_PACING,
    DEFAULT_VOCABULARY
} from '@/lib/constants/narration-options'
import { ERROR_MESSAGES } from '@/lib/constants/error-messages'
import { parseGeminiError, parseDatabaseError } from '@/lib/utils/errors'
import { calculateScriptCost, checkCredits, deductCredits, getUserCredits, InsufficientCreditsError } from '@/lib/credits'
import { checkRateLimit } from '@/lib/middleware/rate-limit'
import { RATE_LIMITS } from '@/lib/constants/rate-limits'

// POST: Generate script with streaming
export async function POST(request: NextRequest) {
    try {
        // Rate limiting check
        const rateLimitResponse = await checkRateLimit(request, RATE_LIMITS.SCRIPT_GENERATE, 'user')
        if (rateLimitResponse) return rateLimitResponse

        const user = await getUserFromRequest(request)
        if (!user) {
            return new Response(
                JSON.stringify({ error: ERROR_MESSAGES.UNAUTHORIZED }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const body = await request.json()
        const {
            topic,
            model: selectedModel = DEFAULT_MODEL,
            duration = DEFAULT_DURATION,
            platform = DEFAULT_PLATFORM,
            tone = DEFAULT_TONE,
            format = DEFAULT_FORMAT,
            targetAudience = '',
            language = DEFAULT_LANGUAGE,
            hookStyle = DEFAULT_HOOK_STYLE,
            additionalNotes = '',
            // Narration customization
            voiceTone = DEFAULT_VOICE_TONE,
            pacing = DEFAULT_PACING,
            vocabularyLevel = DEFAULT_VOCABULARY
        } = body


        if (!topic) {
            return new Response(
                JSON.stringify({ error: ERROR_MESSAGES.TOPIC_REQUIRED }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Ensure user exists in database BEFORE credit operations
        try {
            await prisma.user.upsert({
                where: { id: user.uid },
                update: { email: user.email || '' },
                create: { id: user.uid, email: user.email || '' }
            })
        } catch (error) {
            console.error('❌ User upsert failed:', error)
            const dbError = parseDatabaseError(error)
            return new Response(
                JSON.stringify({ error: dbError.userMessage }),
                { status: dbError.statusCode, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Validate model is in our allowed list (prevent client manipulation)
        const { MODEL_TIERS } = require('@/lib/constants/credits')
        if (!MODEL_TIERS.hasOwnProperty(selectedModel)) {
            return new Response(
                JSON.stringify({ error: 'Invalid AI model selected. Please choose from available models.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Calculate credit cost based on model tier and duration
        // Handle duration as string (e.g., "3m") or number
        const durationValue = typeof duration === 'string' ? parseInt(duration) : duration
        const creditCost = calculateScriptCost(selectedModel, durationValue)

        // Check if user has enough credits
        const hasEnoughCredits = await checkCredits(user.uid, creditCost)

        if (!hasEnoughCredits) {
            const currentCredits = await getUserCredits(user.uid)
            return new Response(
                JSON.stringify({
                    error: 'Insufficient credits',
                    required: creditCost,
                    available: currentCredits,
                    message: `You need ${creditCost} credits but only have ${currentCredits}. Please purchase more credits.`
                }),
                { status: 402, headers: { 'Content-Type': 'application/json' } } // 402 Payment Required
            )
        }

        // Deduct credits BEFORE processing (atomic operation)
        try {
            await deductCredits(
                user.uid,
                creditCost,
                `Script generation: ${topic} (${duration} min)`,
                { topic, duration, platform, tone, format }
            )
        } catch (error) {
            if (error instanceof InsufficientCreditsError) {
                return new Response(
                    JSON.stringify({
                        error: 'Insufficient credits',
                        required: error.required,
                        available: error.available
                    }),
                    { status: 402, headers: { 'Content-Type': 'application/json' } }
                )
            }
            throw error // Re-throw unexpected errors
        }

        // Create script record
        let script
        try {
            script = await prisma.script.create({
                data: {
                    topic,
                    status: 'processing',
                    userId: user.uid,
                },
            })
        } catch (error) {
            const dbError = parseDatabaseError(error)
            // TODO: Refund credits if script creation fails
            return new Response(
                JSON.stringify({ error: dbError.userMessage }),
                { status: dbError.statusCode, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: ERROR_MESSAGES.API_KEY_MISSING }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const genAI = initializeGemini(apiKey)
        const model = getGeminiModel(genAI, selectedModel)

        // Build prompt using centralized builder
        const systemPrompt = buildSystemPrompt({
            topic,
            duration,
            platform,
            tone,
            format,
            targetAudience,
            language,
            hookStyle,
            additionalNotes,
            voiceTone,
            pacing,
            vocabularyLevel
        })

        // Create streaming response
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const result = await model.generateContentStream(systemPrompt)
                    let fullText = ''

                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text()
                        fullText += chunkText

                        // Send chunk to client
                        controller.enqueue(encoder.encode(chunkText))
                    }

                    // Extract keywords from completed script
                    const keywords = extractKeywords(fullText)
                    console.log('🔍 Generated script - Extracted keywords:', keywords)
                    console.log('📝 Script preview:', fullText.substring(0, 200))

                    // Update database with complete script and keywords
                    await prisma.script.update({
                        where: { id: script.id },
                        data: {
                            script: fullText,
                            keywords: keywords,  // Save extracted keywords
                            status: 'completed'
                        }
                    })

                    controller.close()
                } catch (error) {
                    console.error('Streaming error:', error)

                    // Parse error to user-friendly message
                    const appError = parseGeminiError(error)

                    // Update script as failed with user-friendly error
                    try {
                        await prisma.script.update({
                            where: { id: script.id },
                            data: {
                                status: 'failed',
                                error: appError.userMessage
                            }
                        })
                    } catch (dbError) {
                        console.error('Failed to update script status:', dbError)
                    }

                    // Send error message to client as JSON
                    const errorMessage = JSON.stringify({ error: appError.userMessage })
                    controller.enqueue(encoder.encode(`\n\nERROR: ${errorMessage}`))
                    controller.close()
                }
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Script-Id': script.id,
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        console.error('Error in generate stream:', error)
        return new Response(
            JSON.stringify({ error: ERROR_MESSAGES.INTERNAL_ERROR }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
