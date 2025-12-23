import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'
import { ERROR_MESSAGES } from '@/lib/constants/error-messages'
import { CREDIT_COSTS, checkCredits, deductCredits, getUserCredits, InsufficientCreditsError } from '@/lib/credits'

// POST: Trigger TTS generation for a single script section
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { sectionIndex, narasiText, timestamp, voiceId } = body

        // Debug: Log what we received
        console.log('API /generate-section-audio received body:', body)
        console.log('Extracted voiceId:', voiceId)

        if (typeof sectionIndex !== 'number' || !narasiText || !timestamp) {
            return NextResponse.json(
                { error: 'sectionIndex, narasiText, and timestamp are required' },
                { status: 400 }
            )
        }

        // Find script and verify ownership
        const script = await prisma.script.findFirst({
            where: { id, userId: user.uid },
        })

        if (!script) {
            return NextResponse.json({ error: ERROR_MESSAGES.SCRIPT_NOT_FOUND }, { status: 404 })
        }

        // Check credits (3 credits per TTS section)
        const creditCost = CREDIT_COSTS.TTS_SECTION
        const hasEnoughCredits = await checkCredits(user.uid, creditCost)
        if (!hasEnoughCredits) {
            const currentCredits = await getUserCredits(user.uid)
            return NextResponse.json({
                error: 'Insufficient credits',
                required: creditCost,
                available: currentCredits,
                message: `TTS generation requires ${creditCost} credits. You have ${currentCredits}.`
            }, { status: 402 })
        }

        // Deduct credits before processing
        try {
            await deductCredits(
                user.uid,
                creditCost,
                `TTS for section: ${timestamp}`,
                { scriptId: id, sectionIndex, timestamp }
            )
        } catch (error) {
            if (error instanceof InsufficientCreditsError) {
                return NextResponse.json({
                    error: 'Insufficient credits',
                    required: error.required,
                    available: error.available
                }, { status: 402 })
            }
            throw error
        }

        // Trigger TTS webhook for single section
        const ttsWebhookUrl = process.env.N8N_TTS_WEBHOOK_URL
        if (!ttsWebhookUrl) {
            return NextResponse.json({ error: ERROR_MESSAGES.AUDIO_SERVICE_UNAVAILABLE }, { status: 500 })
        }

        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://web-trigger.vercel.app'}/api/scripts/callback`

        // Create a mini-script with just this section for TTS processing
        const sectionScript = `${timestamp}\nNARASI: ${narasiText}`

        // Prepare webhook payload
        const webhookPayload = {
            scriptId: script.id,
            script: sectionScript,
            callbackUrl,
            voiceId: voiceId || 'alloy',  // Pass voice to n8n, default to 'alloy'
        }

        // Debug: Log what we're sending to n8n
        console.log('Sending to TTS webhook:', JSON.stringify(webhookPayload, null, 2))

        fetch(ttsWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload),
        }).catch(err => console.error('TTS webhook error:', err))

        return NextResponse.json({
            success: true,
            message: 'Audio generation started for section',
            sectionIndex,
            timestamp
        })
    } catch (error) {
        console.error('Error triggering section TTS:', error)
        return NextResponse.json(
            { error: ERROR_MESSAGES.AUDIO_GENERATION_FAILED },
            { status: 500 }
        )
    }
}
