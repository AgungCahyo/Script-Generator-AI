import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { PexelsCallbackPayload } from '@/lib/types/pexels'
import { verifyWebhookSignature, devLog } from '@/lib/utils/webhook-security'

// POST: Callback from n8n with Pexels images
export async function POST(request: NextRequest) {
    try {
        // Security: Verify webhook signature
        const signature = request.headers.get('x-webhook-signature')
        const rawBody = await request.text()

        if (!verifyWebhookSignature(rawBody, signature)) {
            return new Response(
                JSON.stringify({ error: 'Invalid webhook signature' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const body: PexelsCallbackPayload = JSON.parse(rawBody)
        const { scriptId, images, status, error } = body

        if (!scriptId || typeof scriptId !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Valid scriptId is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Update script with images - APPEND to existing images
        if (status === 'completed' && images && images.length > 0) {
            // Validate images array size
            if (images.length > 100) {
                return new Response(
                    JSON.stringify({ error: 'Too many images in callback' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                )
            }

            // Get current script to preserve existing media
            const currentScript = await prisma.script.findUnique({
                where: { id: scriptId },
                select: { imageUrls: true }
            })

            // Merge existing images with new images
            const existingMedia = (currentScript?.imageUrls as object[]) || []
            const mergedMedia = [...existingMedia, ...images]

            devLog('[Callback] Adding images:', {
                scriptId,
                existingCount: existingMedia.length,
                newCount: images.length,
                totalCount: mergedMedia.length
            })

            await prisma.script.update({
                where: { id: scriptId },
                data: { imageUrls: mergedMedia as unknown as object[] }
            })

            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Added ${images.length} images (total: ${mergedMedia.length})`,
                    scriptId,
                    images: mergedMedia
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Handle error case
        if (status === 'failed' || error) {
            console.error(`Pexels callback failed for ${scriptId}:`, error)
            return new Response(
                JSON.stringify({
                    success: false,
                    error: error || 'Unknown error',
                    scriptId
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ success: true, scriptId }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error in Pexels callback:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
