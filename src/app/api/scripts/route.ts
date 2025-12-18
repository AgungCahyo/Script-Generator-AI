import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/firebase-admin'

// Helper to get user from token
async function getUserFromRequest(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return null
    }
    const token = authHeader.split('Bearer ')[1]
    return await verifyToken(token)
}

// GET: Fetch all scripts for authenticated user
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const scripts = await prisma.script.findMany({
            where: { userId: user.uid },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json({ scripts })
    } catch (error) {
        console.error('Error fetching scripts:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
