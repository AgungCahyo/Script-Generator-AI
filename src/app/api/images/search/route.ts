import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/api/auth'
import prisma from '@/lib/prisma'
import { calculateImageSearchCost, checkCredits, deductCredits, getUserCredits, InsufficientCreditsError } from '@/lib/credits'

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const body = await request.json()
        const { scriptId, keywords, count = 5, orientation = 'landscape', source = 'pexels' } = body

        if (!scriptId || !keywords) {
            return new Response(
                JSON.stringify({ error: 'scriptId and keywords are required' }),
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

        // Calculate credit cost (1 credit per 5 images)
        const creditCost = calculateImageSearchCost(count)

        // Check credits
        const hasEnoughCredits = await checkCredits(user.uid, creditCost)
        if (!hasEnoughCredits) {
            const currentCredits = await getUserCredits(user.uid)
            return new Response(
                JSON.stringify({
                    error: 'Insufficient credits',
                    required: creditCost,
                    available: currentCredits,
                    message: `Image search for ${count} images requires ${creditCost} credits. You have ${currentCredits}.`
                }),
                { status: 402, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Deduct credits before processing
        try {
            await deductCredits(
                user.uid,
                creditCost,
                `Image search: ${keywords} (${count} images)`,
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

        // Get image search webhook URL from environment
        const webhookUrl = process.env.IMAGE_SEARCH_WEBHOOK_URL || process.env.PEXELS_WEBHOOK_URL

        if (!webhookUrl) {
            return new Response(
                JSON.stringify({ error: 'Image search webhook not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Construct callback URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const callbackUrl = `${appUrl}/api/images/callback`

        // Trigger n8n webhook for image search (supports both Pexels and Pixabay)
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
                source, // NEW: pexels or pixabay
                callbackUrl
            }),
        })

        if (!response.ok) {
            console.error('Image search webhook failed:', await response.text())
            return new Response(
                JSON.stringify({ error: 'Failed to trigger image search' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `${source === 'pixabay' ? 'Pixabay' : 'Pexels'} image search initiated`,
                source
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error in image search:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
