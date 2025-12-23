import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// CORS headers for n8n webhook
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

// OPTIONS: Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200, headers: corsHeaders })
}

// POST: Callback from n8n with stock videos (Pexels/Pixabay)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { scriptId, videos, status, error } = body

        if (!scriptId) {
            return new Response(
                JSON.stringify({ error: 'scriptId is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Update script with videos - APPEND to existing videos
        if (status === 'completed' && videos && videos.length > 0) {
            // Get current script to preserve existing media
            const currentScript = await prisma.script.findUnique({
                where: { id: scriptId },
                select: { imageUrls: true }
            })

            // Merge existing videos with new videos (stored in imageUrls as mixed media)
            const existingMedia = (currentScript?.imageUrls as object[]) || []
            const mergedMedia = [...existingMedia, ...videos.map((v: any) => ({ ...v, type: 'video' }))]

            await prisma.script.update({
                where: { id: scriptId },
                data: { imageUrls: mergedMedia as unknown as object[] }
            })

            return new Response(
                JSON.stringify({
                    success: true,
                    message: `Added ${videos.length} videos (total: ${mergedMedia.length})`,
                    scriptId,
                    videos: mergedMedia
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Handle error case
        if (status === 'failed' || error) {
            console.error(`Video callback failed for ${scriptId}:`, error)
            return new Response(
                JSON.stringify({
                    success: false,
                    error: error || 'Unknown error',
                    scriptId
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Received callback' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Video callback error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
}
