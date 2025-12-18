import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all scripts (history)
export async function GET() {
    try {
        const scripts = await prisma.script.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to last 50 scripts
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
