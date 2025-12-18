import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST: Receive callback from n8n with generated script
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { scriptId, script, audioBase64, status, error } = body

        if (!scriptId) {
            return NextResponse.json(
                { error: 'scriptId is required' },
                { status: 400 }
            )
        }

        // Find the script record
        const existingScript = await prisma.script.findUnique({
            where: { id: scriptId },
        })

        if (!existingScript) {
            return NextResponse.json(
                { error: 'Script not found' },
                { status: 404 }
            )
        }

        // Convert base64 audio to data URL if present
        let audioUrl = null
        if (audioBase64) {
            audioUrl = `data:audio/mpeg;base64,${audioBase64}`
        }

        // Update the script with results
        const updatedScript = await prisma.script.update({
            where: { id: scriptId },
            data: {
                script: script || null,
                audioUrl: audioUrl,
                status: status || 'completed',
                error: error || null,
            },
        })

        return NextResponse.json({
            success: true,
            script: updatedScript,
        })
    } catch (error) {
        console.error('Error processing callback:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
