import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'
import { initializeGemini, getGeminiModel } from '@/lib/api/gemini'
import { buildSystemPrompt } from '@/lib/prompts/builders'
import { DEFAULT_MODEL } from '@/lib/constants/models'
import {
    DEFAULT_DURATION,
    DEFAULT_PLATFORM,
    DEFAULT_TONE,
    DEFAULT_FORMAT,
    DEFAULT_LANGUAGE,
    DEFAULT_HOOK_STYLE
} from '@/lib/constants/script-options'
import { ERROR_MESSAGES } from '@/lib/constants/error-messages'
import { parseGeminiError, parseDatabaseError } from '@/lib/utils/errors'

// POST: Generate script with streaming
export async function POST(request: NextRequest) {
    try {
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
            additionalNotes = ''
        } = body

        if (!topic) {
            return new Response(
                JSON.stringify({ error: ERROR_MESSAGES.TOPIC_REQUIRED }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Ensure user exists in database
        try {
            await prisma.user.upsert({
                where: { id: user.uid },
                update: { email: user.email || '' },
                create: { id: user.uid, email: user.email || '' }
            })
        } catch (error) {
            const dbError = parseDatabaseError(error)
            return new Response(
                JSON.stringify({ error: dbError.userMessage }),
                { status: dbError.statusCode, headers: { 'Content-Type': 'application/json' } }
            )
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
            additionalNotes
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

                    // Update database with complete script
                    await prisma.script.update({
                        where: { id: script.id },
                        data: {
                            script: fullText,
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
