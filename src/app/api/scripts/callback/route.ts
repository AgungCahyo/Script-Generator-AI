import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST: Receive callback from n8n
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { scriptId, script, audioUrl, audioBase64, status, error } = body

        if (!scriptId) {
            return NextResponse.json({ error: 'scriptId is required' }, { status: 400 })
        }

        const existingScript = await prisma.script.findUnique({
            where: { id: scriptId },
        })

        if (!existingScript) {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 })
        }

        // Build update data
        const updateData: Record<string, unknown> = {}

        if (script !== undefined) {
            updateData.script = script
        }

        // Support both audioUrl (Google Drive) and audioBase64 (legacy)
        if (audioUrl !== undefined && audioUrl !== null) {
            updateData.audioUrl = audioUrl
        } else if (audioBase64 !== undefined && audioBase64 !== null) {
            updateData.audioUrl = `data:audio/mpeg;base64,${audioBase64}`
        }

        if (status) {
            updateData.status = status
        }

        if (error !== undefined) {
            updateData.error = error
        }

        const updatedScript = await prisma.script.update({
            where: { id: scriptId },
            data: updateData,
        })

        return NextResponse.json({ success: true, script: updatedScript })
    } catch (error) {
        console.error('Error processing callback:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
