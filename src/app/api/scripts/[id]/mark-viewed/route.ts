import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'
import { ERROR_MESSAGES } from '@/lib/constants/error-messages'
import { parseDatabaseError } from '@/lib/utils/errors'

/**
 * POST: Mark script as viewed (set firstViewedAt timestamp)
 * Only sets the timestamp if it's currently null (first view only)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const script = await prisma.script.findFirst({
            where: { id, userId: user.uid },
        })

        if (!script) {
            return NextResponse.json({ error: ERROR_MESSAGES.SCRIPT_NOT_FOUND }, { status: 404 })
        }

        // Only update if firstViewedAt is null (hasn't been viewed yet)
        if (!script.firstViewedAt) {
            const updatedScript = await prisma.script.update({
                where: { id },
                data: { firstViewedAt: new Date() },
            })

            return NextResponse.json({
                success: true,
                script: updatedScript,
                message: 'Script marked as viewed'
            })
        }

        // Already viewed, return as-is
        return NextResponse.json({
            success: true,
            script,
            message: 'Script already viewed'
        })
    } catch (error) {
        console.error('Error marking script as viewed:', error)
        const dbError = parseDatabaseError(error)
        return NextResponse.json(
            { error: dbError.userMessage },
            { status: dbError.statusCode }
        )
    }
}
