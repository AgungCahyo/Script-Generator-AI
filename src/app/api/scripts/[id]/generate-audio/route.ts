import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'
import { ERROR_MESSAGES } from '@/lib/constants/error-messages'

// POST: Trigger TTS generation for a script
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

        // Find script and verify ownership
        const script = await prisma.script.findFirst({
            where: { id, userId: user.uid },
        })

        if (!script) {
            return NextResponse.json({ error: ERROR_MESSAGES.SCRIPT_NOT_FOUND }, { status: 404 })
        }

        if (!script.script) {
            return NextResponse.json({ error: 'Script has no content to convert' }, { status: 400 })
        }

        // Trigger TTS webhook
        const ttsWebhookUrl = process.env.N8N_TTS_WEBHOOK_URL
        if (!ttsWebhookUrl) {
            return NextResponse.json({ error: ERROR_MESSAGES.AUDIO_SERVICE_UNAVAILABLE }, { status: 500 })
        }

        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://web-trigger.vercel.app'}/api/scripts/callback`

        fetch(ttsWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scriptId: script.id,
                script: script.script,
                callbackUrl,
            }),
        }).catch(err => console.error('TTS webhook error:', err))

        return NextResponse.json({ success: true, message: 'Audio generation started' })
    } catch (error) {
        console.error('Error triggering TTS:', error)
        return NextResponse.json(
            { error: ERROR_MESSAGES.AUDIO_GENERATION_FAILED },
            { status: 500 }
        )
    }
}
