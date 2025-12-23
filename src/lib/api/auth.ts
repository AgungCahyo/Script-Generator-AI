import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/firebase-admin'
import prisma from '@/lib/prisma'
import { PLAN_LIMITS } from '@/lib/constants/credits'

/**
 * Extract and verify user from Authorization header
 * @param request - NextRequest with Authorization header
 * @returns User object or null if unauthorized
 */
export async function getUserFromRequest(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return null
    }
    const token = authHeader.split('Bearer ')[1]
    return await verifyToken(token)
}

/**
 * Ensure user exists in database, create if first time login
 * @param userId - Firebase user ID
 * @param email - User email
 * @returns User record
 */
export async function ensureUserExists(userId: string, email: string | null) {
    // Try to find existing user
    let user = await prisma.user.findUnique({
        where: { id: userId }
    })

    // Create user if doesn't exist (first time login)
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: userId,
                email: email || '',
                credits: PLAN_LIMITS.FREE.startingCredits, // 10 starting credits
                creditsPurchased: PLAN_LIMITS.FREE.startingCredits,
                creditsUsed: 0,
            }
        })

        // Log the starting credit grant
        await prisma.creditTransaction.create({
            data: {
                userId: userId,
                amount: PLAN_LIMITS.FREE.startingCredits,
                type: 'BONUS',
                description: 'Welcome bonus - Starting credits',
                balanceAfter: PLAN_LIMITS.FREE.startingCredits,
                metadata: { reason: 'first_login' }
            }
        })
    }

    return user
}
