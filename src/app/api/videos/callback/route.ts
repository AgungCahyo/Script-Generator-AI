import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyWebhookSignature, devLog } from '@/lib/utils/webhook-security'

interface VideoCallbackPayload {
    scriptId: string
    videos: Array<{
        videoUrl: string
        thumbnailUrl?: string
        source: string
        id: string | number
    }>
    status: 'completed' | 'failed'
    error?: string
}

// POST: Callback from n8n with stock videos (Pexels/Pixabay)
export async function POST(request: NextRequest) {
    try {
        // Security: Verify webhook signature
        const signature = request.headers.get('x-webhook-signature')
        const rawBody = await request.text()

        if (!verifyWebhookSignature(rawBody, signature)) {
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 403 }
            )
        }

        const body: VideoCallbackPayload = JSON.parse(rawBody)
        const { scriptId, videos, status, error } = body

        if (!scriptId || typeof scriptId !== 'string') {
            return NextResponse.json({ error: 'Valid scriptId is required' }, { status: 400 })
        }

        if (status === 'completed' && videos && videos.length > 0) {
            // Validate videos array size
            if (videos.length > 50) {
                return NextResponse.json({ error: 'Too many videos in callback' }, { status: 400 })
            }

            // Get current script to preserve existing videos (stored in imageUrls as mixed media)
            const currentScript = await prisma.script.findUnique({
                where: { id: scriptId },
                select: { imageUrls: true }
            })

            const existingMedia = (currentScript?.imageUrls as object[]) || []
            const mergedMedia = [...existingMedia, ...videos.map((v: any) => ({ ...v, type: 'video' }))]

            devLog('[Video Callback] Adding videos:', {
                scriptId,
                existingCount: existingMedia.length,
                newCount: videos.length,
                totalCount: mergedMedia.length
            })

            await prisma.script.update({
                where: { id: scriptId },
                data: { imageUrls: mergedMedia as unknown as object[] }
            })

            return NextResponse.json({
                success: true,
                message: `Added ${videos.length} videos (total: ${mergedMedia.length})`,
                scriptId,
                videos: mergedMedia
            })
        }

        if (status === 'failed' || error) {
            console.error(`Video callback failed for ${scriptId}:`, error)
            return NextResponse.json({
                success: false,
                error: error || 'Unknown error',
                scriptId
            })
        }

        return NextResponse.json({ success: true, scriptId })
    } catch (error) {
        console.error('Error in video callback:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
