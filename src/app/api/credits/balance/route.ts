import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, ensureUserExists } from '@/lib/api/auth'
import prisma from '@/lib/prisma'

// GET: Get user's current credit balance
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Ensure user exists in database (auto-create on first login)
        const dbUser = await ensureUserExists(user.uid, user.email || null)

        // Get user credit info
        const userWithCredits = await prisma.user.findUnique({
            where: { id: user.uid },
            select: {
                credits: true,
                creditsPurchased: true,
                creditsUsed: true,
            }
        })

        return NextResponse.json({
            credits: userWithCredits?.credits || 0,
            creditsPurchased: userWithCredits?.creditsPurchased || 0,
            creditsUsed: userWithCredits?.creditsUsed || 0,
        })
    } catch (error) {
        console.error('Error fetching credit balance:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
