import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractKeywords } from '@/lib/utils/keywords'

// POST: Receive callback from n8n
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { scriptId, script, audioUrl, audioFiles, audioBase64, status, error } = body

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
            // Extract and save keywords for media search
            updateData.keywords = extractKeywords(script)
        }

        // Support audioFiles array (new format) - MERGE with existing audio files
        if (audioFiles !== undefined && audioFiles !== null && Array.isArray(audioFiles)) {
            // Get existing audioFiles from database
            const existingAudioFiles = (existingScript.audioFiles as any[]) || []

            // Create a map of existing audio files by timestamp for easy lookup
            const existingAudioMap = new Map()
            existingAudioFiles.forEach((audio: any) => {
                if (audio.timestamp) {
                    existingAudioMap.set(audio.timestamp, audio)
                }
            })

            // Merge: Add or update audio files from the new batch
            audioFiles.forEach((newAudio: any) => {
                if (newAudio.timestamp) {
                    existingAudioMap.set(newAudio.timestamp, newAudio)
                }
            })

            // Convert map back to array and sort by blockIndex
            const mergedAudioFiles = Array.from(existingAudioMap.values())
                .sort((a: any, b: any) => (a.blockIndex || 0) - (b.blockIndex || 0))

            updateData.audioFiles = mergedAudioFiles
        }
        // Support single audioUrl (legacy or fallback)
        else if (audioUrl !== undefined && audioUrl !== null) {
            updateData.audioUrl = audioUrl
        }
        // Support audioBase64 (legacy)
        else if (audioBase64 !== undefined && audioBase64 !== null) {
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
