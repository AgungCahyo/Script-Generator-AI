import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/api/auth'
import { ERROR_MESSAGES } from '@/lib/constants/error-messages'
import { parseDatabaseError } from '@/lib/utils/errors'

// GET: Fetch single script by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
        }

        const { id } = await params

        const script = await prisma.script.findFirst({
            where: { id, userId: user.uid },
        })

        if (!script) {
            return NextResponse.json({ error: ERROR_MESSAGES.SCRIPT_NOT_FOUND }, { status: 404 })
        }

        return NextResponse.json({ script })
    } catch (error) {
        console.error('Error fetching script:', error)
        const dbError = parseDatabaseError(error)
        return NextResponse.json(
            { error: dbError.userMessage },
            { status: dbError.statusCode }
        )
    }
}

// DELETE: Delete a script
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const script = await prisma.script.findFirst({
            where: { id, userId: user.uid },
        })

        if (!script) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 })
        }

        await prisma.script.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting script:', error)
        const dbError = parseDatabaseError(error)
        return NextResponse.json(
            { error: dbError.userMessage },
            { status: dbError.statusCode }
        )
    }
}

// PATCH: Update script content or topic
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { script, topic } = body

        // At least one field must be provided
        if (script === undefined && topic === undefined) {
            return NextResponse.json(
                { error: 'Script content or topic is required' },
                { status: 400 }
            )
        }

        // Verify ownership
        const existingScript = await prisma.script.findFirst({
            where: { id, userId: user.uid },
        })

        if (!existingScript) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 })
        }

        // Build update data dynamically
        const updateData: { script?: string; topic?: string; audioUrl?: null } = {}

        if (script !== undefined) {
            updateData.script = script
            updateData.audioUrl = null // Reset audio when script changes
        }

        if (topic !== undefined) {
            updateData.topic = topic
        }

        const updatedScript = await prisma.script.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json({ success: true, script: updatedScript })
    } catch (error) {
        console.error('Error updating script:', error)
        const dbError = parseDatabaseError(error)
        return NextResponse.json(
            { error: dbError.userMessage },
            { status: dbError.statusCode }
        )
    }
}
