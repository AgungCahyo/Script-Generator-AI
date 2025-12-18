import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch single script by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const script = await prisma.script.findUnique({
            where: { id },
        })

        if (!script) {
            return NextResponse.json(
                { error: 'Script not found' },
                { status: 404 }
            )
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
        const { id } = await params

        await prisma.script.delete({
            where: { id },
        })

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
        const { id } = await params
        const body = await request.json()
        const { script } = body

        if (script === undefined) {
            return NextResponse.json(
                { error: 'Script content is required' },
                { status: 400 }
            )
        }

        const updatedScript = await prisma.script.update({
            where: { id },
            data: {
                script,
                // Clear audio when script is edited
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
