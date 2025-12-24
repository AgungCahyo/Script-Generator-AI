import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/api/auth'
import prisma from '@/lib/prisma'
import { calculateVideoSearchCost, checkCredits, deductCredits, getUserCredits, InsufficientCreditsError } from '@/lib/credits'
import { checkRateLimit } from '@/lib/middleware/rate-limit'
import { RATE_LIMITS } from '@/lib/constants/rate-limits'

export async function POST(request: NextRequest) {
    try {
        // Rate limiting check
        const rateLimitResponse = await checkRateLimit(request, RATE_LIMITS.VIDEO_SEARCH, 'user')
        if (rateLimitResponse) return rateLimitResponse

        const user = await getUserFromRequest(request)


        if (!user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const body = await request.json()
        const { scriptId, keywords, count = 5, orientation = 'landscape', source = 'pexels' } = body

        const isAI = source === 'ai'

        if (!scriptId || !keywords) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Verify script ownership
        const script = await prisma.script.findUnique({
            where: { id: scriptId },
            select: { userId: true }
        })

        if (!script || script.userId !== user.uid) {
            return new Response(
                JSON.stringify({ error: 'Script not found or unauthorized' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Calculate credit cost: AI = 20 credits/video, Stock = 2 credits/video
        const creditCost = isAI ? count * 20 : calculateVideoSearchCost(count)

        // AI videos limited to 1 per request (very expensive!)
        if (isAI && count > 1) {
            return new Response(
                JSON.stringify({ error: 'AI video generation limited to 1 video per request' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Check credits
        const hasEnoughCredits = await checkCredits(user.uid, creditCost)
        if (!hasEnoughCredits) {
            const currentCredits = await getUserCredits(user.uid)
            return new Response(
                JSON.stringify({
                    error: 'Insufficient credits',
                    required: creditCost,
                    available: currentCredits,
                    message: `Video search for ${count} videos requires ${creditCost} credits. You have ${currentCredits}.`
                }),
                { status: 402, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Deduct credits before processing
        try {
            await deductCredits(
                user.uid,
                creditCost,
                isAI ? `AI video generation (Sora-2)` : `Video search: ${keywords} (${count} videos)`,
                { scriptId, keywords, count, source }
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
            throw error
        }

        // Get appropriate webhook URL based on source
        const webhookUrl = isAI
            ? process.env.AI_VIDEO_WEBHOOK_URL
            : process.env.VIDEO_SEARCH_WEBHOOK_URL

        if (!webhookUrl) {
            return new Response(
                JSON.stringify({
                    error: isAI
                        ? 'AI video generation webhook not configured'
                        : 'Video search webhook not configured'
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Construct callback URL for videos (trim to remove newlines)
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()
        const callbackUrl = `${appUrl}/api/videos/callback`

        // Trigger n8n webhook for video search or AI generation
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                scriptId,
                keywords,
                count: parseInt(count.toString()) || 5,
                orientation,
                source, // pexels or pixabay
                callbackUrl
            }),
        })

        if (!response.ok) {
            console.error('Video search webhook failed:', await response.text())
            return new Response(
                JSON.stringify({ error: 'Failed to trigger video search' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: isAI
                    ? 'AI video generation initiated (~3 minutes)'
                    : `${source === 'pixabay' ? 'Pixabay' : 'Pexels'} video search initiated`,
                source
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('[VIDEO SEARCH ERROR]', error)
        console.error('[VIDEO SEARCH ERROR] Stack:', error instanceof Error ? error.stack : 'No stack trace')
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error)
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
