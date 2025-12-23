import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/api/auth'
import { getCreditHistory } from '@/lib/credits'

// GET: Get credit transaction history
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get pagination parameters from query
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50')
        const page = parseInt(searchParams.get('page') || '1')
        const offset = (page - 1) * limit

        // Get credit history with pagination
        const transactions = await getCreditHistory(user.uid, limit + 1) // Get one extra to check if there's more

        // Check if there are more transactions
        const hasMore = transactions.length > limit
        const paginatedTransactions = transactions.slice(offset, offset + limit)

        return NextResponse.json({
            transactions: paginatedTransactions,
            pagination: {
                page,
                limit,
                hasMore,
                total: transactions.length
            }
        })
    } catch (error) {
        console.error('Error fetching credit history:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
