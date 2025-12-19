import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'
import { ERROR_MESSAGES } from '@/lib/constants/error-messages'
import { parseDatabaseError } from '@/lib/utils/errors'

// GET: Fetch all scripts for authenticated user
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
        }

        const scripts = await prisma.script.findMany({
            where: { userId: user.uid },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json({ scripts })
    } catch (error) {
        console.error('Error fetching scripts:', error)
        const dbError = parseDatabaseError(error)
        return NextResponse.json(
            { error: dbError.userMessage },
            { status: dbError.statusCode }
        )
    }
}
