import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'

// POST: Trigger script generation
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            topic,
            duration,
            platform,
            tone,
            format,
            targetAudience,
            language,
            hookStyle,
            additionalNotes
        } = body

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
        }

        // Ensure user exists in database
        await prisma.user.upsert({
            where: { id: user.uid },
            update: { email: user.email || '' },
            create: { id: user.uid, email: user.email || '' }
        })

        // Create script record
        const script = await prisma.script.create({
            data: {
                topic,
                status: 'processing',
                userId: user.uid,
            },
        })

        // Trigger n8n webhook
        const webhookUrl = process.env.N8N_WEBHOOK_URL
        if (!webhookUrl) {
            return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 })
        }

        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://web-trigger.vercel.app'}/api/scripts/callback`

        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scriptId: script.id,
                topic,
                duration: duration || '3m',
                platform: platform || 'youtube',
                tone: tone || 'casual',
                format: format || 'monolog',
                targetAudience: targetAudience || '',
                language: language || 'id-casual',
                hookStyle: hookStyle || 'question',
                additionalNotes: additionalNotes || '',
                callbackUrl,
            }),
        }).catch(err => console.error('Webhook error:', err))

        return NextResponse.json({ success: true, scriptId: script.id })
    } catch (error) {
        console.error('Error triggering script:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
