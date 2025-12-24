import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'
import { ERROR_MESSAGES } from '@/lib/constants/error-messages'

// POST: Delete TTS audio for a specific script section
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
        const body = await request.json()
        const { timestamp } = body

        if (!timestamp) {
            return NextResponse.json(
                { error: 'timestamp is required' },
                { status: 400 }
            )
        }

        // Find script and verify ownership
        const script = await prisma.script.findFirst({
            where: { id, userId: user.uid },
        })

        if (!script) {
            return NextResponse.json({ error: ERROR_MESSAGES.SCRIPT_NOT_FOUND }, { status: 404 })
        }

        // Get current audioFiles array
        const currentAudioFiles = (script.audioFiles as any[]) || []

        // Filter out the audio file matching this timestamp
        const updatedAudioFiles = currentAudioFiles.filter(
            (af) => af.timestamp !== timestamp
        )

        // Update script with filtered audioFiles
        await prisma.script.update({
            where: { id },
            data: {
                audioFiles: updatedAudioFiles,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Audio deleted successfully',
            timestamp
        })
    } catch (error) {
        console.error('Error deleting section audio:', error)
        return NextResponse.json(
            { error: 'Failed to delete audio' },
            { status: 500 }
        )
    }
}
