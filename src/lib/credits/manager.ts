import prisma from '@/lib/prisma'
import { CreditTransactionType } from '@prisma/client'

/**
 * Check if user has enough credits
 */
export async function checkCredits(
    userId: string,
    required: number
): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    })

    if (!user) {
        throw new Error('User not found')
    }

    return user.credits >= required
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    })

    if (!user) {
        throw new Error('User not found')
    }

    return user.credits
}

/**
 * Deduct credits from user balance (for usage)
 * This is atomic to prevent race conditions
 */
export async function deductCredits(
    userId: string,
    amount: number,
    reason: string,
    metadata?: any
): Promise<void> {
    if (amount <= 0) {
        throw new Error('Amount must be positive')
    }

    // Use transaction for atomicity
    await prisma.$transaction(async (tx) => {
        // Get current balance with lock
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { credits: true },
        })

        if (!user) {
            throw new Error('User not found')
        }

        if (user.credits < amount) {
            throw new InsufficientCreditsError(amount, user.credits)
        }

        const newBalance = user.credits - amount

        // Update user credits
        await tx.user.update({
            where: { id: userId },
            data: {
                credits: newBalance,
                creditsUsed: { increment: amount },
            },
        })

        // Create transaction record
        await tx.creditTransaction.create({
            data: {
                userId,
                amount: -amount, // Negative for deduction
                type: 'USAGE',
                description: reason,
                balanceAfter: newBalance,
                metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
            },
        })
    })
}

/**
 * Add credits to user balance (for purchases, grants, bonuses)
 */
export async function addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionType,
    description: string,
    metadata?: any
): Promise<void> {

    if (amount <= 0) {
        throw new Error('Amount must be positive')
    }

    await prisma.$transaction(async (tx) => {
        // Get current balance
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { credits: true, creditsPurchased: true },
        })

        if (!user) {
            throw new Error('User not found')
        }

        const newBalance = user.credits + amount

        // Update user credits
        const updateData: any = {
            credits: newBalance,
        }

        // Track purchases separately
        if (type === 'PURCHASE' || type === 'BONUS') {
            updateData.creditsPurchased = { increment: amount }
        }

        await tx.user.update({
            where: { id: userId },
            data: updateData,
        })

        // Create transaction record
        await tx.creditTransaction.create({
            data: {
                userId,
                amount, // Positive for addition
                type,
                description,
                balanceAfter: newBalance,
                metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
            },
        })

    })
}

/**
 * Get credit transaction history for a user
 */
export async function getCreditHistory(
    userId: string,
    limit: number = 50
) {
    return prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
}

/**
 * Calculate credit cost for script generation (TIERED by model)
 */
export function calculateScriptCost(
    model: string,
    durationMinutes: number
): number {
    const { CREDIT_COSTS, MODEL_TIERS } = require('@/lib/constants/credits')

    // Get tier for the model (default to tier 2 if unknown)
    const tier = MODEL_TIERS[model] || 2

    // Determine base cost based on tier
    const baseCost =
        tier === 1 ? CREDIT_COSTS.SCRIPT_TIER_1 :  // Economy: 20 credits
            tier === 2 ? CREDIT_COSTS.SCRIPT_TIER_2 :  // Standard: 30 credits
                CREDIT_COSTS.SCRIPT_TIER_3    // Premium: 50 credits

    // Add duration cost
    const durationCost = durationMinutes * CREDIT_COSTS.SCRIPT_PER_MINUTE

    return baseCost + durationCost
}

/**
 * Calculate credit cost for image search
 */
export function calculateImageSearchCost(count: number): number {
    const { CREDIT_COSTS } = require('@/lib/constants/credits')
    return Math.ceil(count / 5) * CREDIT_COSTS.IMAGE_SEARCH_PER_5
}

/**
 * Calculate credit cost for video search
 */
export function calculateVideoSearchCost(count: number): number {
    const { CREDIT_COSTS } = require('@/lib/constants/credits')
    return count * CREDIT_COSTS.VIDEO_SEARCH
}

/**
 * Custom error for insufficient credits
 */
export class InsufficientCreditsError extends Error {
    required: number
    available: number

    constructor(required: number, available: number) {
        super(`Insufficient credits. Required: ${required}, Available: ${available}`)
        this.name = 'InsufficientCreditsError'
        this.required = required
        this.available = available
    }
}
