import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST: Trigger TTS generation for a script
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Find the script
        const script = await prisma.script.findUnique({
            where: { id },
        })

        if (!script) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 })
        }

        if (!script.script) {
            return NextResponse.json({ error: 'No script text to convert' }, { status: 400 })
        }

        // Get callback URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const callbackUrl = `${appUrl}/api/scripts/callback`

        // Get TTS webhook URL
        const ttsWebhookUrl = process.env.N8N_TTS_WEBHOOK_URL
        if (!ttsWebhookUrl) {
            return NextResponse.json(
                { error: 'N8N_TTS_WEBHOOK_URL not configured' },
                { status: 500 }
            )
        }

        // Trigger TTS webhook (non-blocking)
        fetch(ttsWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scriptId: id,
                script: script.script,
                callbackUrl: callbackUrl,
            }),
        }).catch((error) => {
            console.error('Failed to trigger TTS webhook:', error)
        })

        return NextResponse.json({
            success: true,
            message: 'TTS generation started',
        })
    } catch (error) {
        console.error('Error triggering TTS:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
