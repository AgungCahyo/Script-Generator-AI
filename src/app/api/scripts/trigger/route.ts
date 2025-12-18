import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST: Trigger n8n webhook with topic
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { topic, generateTts = true } = body

        if (!topic || typeof topic !== 'string') {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400 }
            )
        }

        // Create new script record with pending status
        const script = await prisma.script.create({
            data: {
                topic: topic.trim(),
                status: 'processing',
            },
        })

        // Get callback URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const callbackUrl = `${appUrl}/api/scripts/callback`

        // Trigger n8n webhook
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
        if (!n8nWebhookUrl) {
            await prisma.script.update({
                where: { id: script.id },
                data: { status: 'failed', error: 'N8N_WEBHOOK_URL not configured' },
            })
            return NextResponse.json(
                { error: 'N8N_WEBHOOK_URL not configured' },
                { status: 500 }
            )
        }

        // Send request to n8n (non-blocking)
        fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                scriptId: script.id,
                topic: topic.trim(),
                callbackUrl: callbackUrl,
                generateTts: generateTts,
            }),
        }).catch((error) => {
            console.error('Failed to trigger n8n webhook:', error)
            prisma.script.update({
                where: { id: script.id },
                data: { status: 'failed', error: 'Failed to trigger n8n webhook' },
            }).catch(console.error)
        })

        return NextResponse.json({
            success: true,
            scriptId: script.id,
            message: 'Script generation started',
        })
    } catch (error) {
        console.error('Error triggering script:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
