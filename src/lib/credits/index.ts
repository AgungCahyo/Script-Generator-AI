import prisma from '@/lib/prisma'

/**
 * Custom error class for insufficient credits
 */
export class InsufficientCreditsError extends Error {
    required: number
    available: number

    constructor(required: number, available: number) {
        super(`Insufficient credits: required ${required}, available ${available}`)
        this.name = 'InsufficientCreditsError'
        this.required = required
        this.available = available
    }
}

/**
 * Calculate credit cost based on script duration
 * Pricing: 1 credit per minute
 */
export function calculateScriptCost(durationMinutes: number): number {
    return Math.max(1, Math.floor(durationMinutes))
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
    })

    return user?.credits ?? 0
}

/**
 * Check if user has enough credits for an operation
 */
export async function checkCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const currentCredits = await getUserCredits(userId)
    return currentCredits >= requiredCredits
}

/**
 * Deduct credits from user account (atomic operation)
 * @throws InsufficientCreditsError if user doesn't have enough credits
 */
export async function deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
): Promise<void> {
    // Get current balance
    const currentCredits = await getUserCredits(userId)

    if (currentCredits < amount) {
        throw new InsufficientCreditsError(amount, currentCredits)
    }

    // Perform atomic deduction using transaction
    await prisma.$transaction(async (tx) => {
        // Decrement user credits
        await tx.user.update({
            where: { id: userId },
            data: {
                credits: {
                    decrement: amount
                }
            }
        })

        // Create transaction record
        await tx.creditTransaction.create({
            data: {
                userId,
                amount: -amount, // Negative for deduction
                type: 'deduction',
                description,
                metadata: metadata || {}
            }
        })
    })
}

/**
 * Add credits to user account (for purchases/refunds)
 */
export async function addCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
): Promise<void> {
    await prisma.$transaction(async (tx) => {
        // Increment user credits
        await tx.user.update({
            where: { id: userId },
            data: {
                credits: {
                    increment: amount
                }
            }
        })

        // Create transaction record
        await tx.creditTransaction.create({
            data: {
                userId,
                amount, // Positive for addition
                type: 'purchase',
                description,
                metadata: metadata || {}
            }
        })
    })
}
