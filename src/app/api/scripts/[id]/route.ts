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

// GET: Fetch single script by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const script = await prisma.script.findFirst({
            where: { id, userId: user.uid },
        })

        if (!script) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 })
        }

        return NextResponse.json({ script })
    } catch (error) {
        console.error('Error fetching script:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
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
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH: Update script content
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
        const { script } = body

        if (script === undefined) {
            return NextResponse.json(
                { error: 'Script content is required' },
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

        const updatedScript = await prisma.script.update({
            where: { id },
            data: {
                script,
                audioUrl: null
            },
        })

        return NextResponse.json({ success: true, script: updatedScript })
    } catch (error) {
        console.error('Error updating script:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
