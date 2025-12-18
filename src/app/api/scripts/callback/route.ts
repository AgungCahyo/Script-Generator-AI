import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST: Receive callback from n8n with generated script
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { scriptId, script, audioUrl, status, error } = body

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

        // Update the script with results
        const updatedScript = await prisma.script.update({
            where: { id: scriptId },
            data: {
                script: script || null,
                audioUrl: audioUrl || null,
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
