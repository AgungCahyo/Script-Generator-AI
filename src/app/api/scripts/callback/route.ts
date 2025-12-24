import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractKeywords } from '@/lib/utils/keywords'
import { verifyWebhookSignature, devLog } from '@/lib/utils/webhook-security'

// POST: Receive callback from n8n
export async function POST(request: NextRequest) {
    try {
        // Security: Verify webhook signature
        const signature = request.headers.get('x-webhook-signature')
        const rawBody = await request.text()

        if (!verifyWebhookSignature(rawBody, signature)) {
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 403 }
            )
        }

        const body = JSON.parse(rawBody)
        const { scriptId, script, audioUrl, audioFiles, audioBase64, status, error } = body

        // Input validation
        if (!scriptId || typeof scriptId !== 'string') {
            return NextResponse.json({ error: 'Valid scriptId is required' }, { status: 400 })
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
            // Validate script length
            if (typeof script === 'string' && script.length > 100000) {
                return NextResponse.json({ error: 'Script too large' }, { status: 400 })
            }

            updateData.script = script
            // Extract and save keywords for media search
            const extractedKeywords = extractKeywords(script)
            devLog('🔍 Extracted keywords:', extractedKeywords)
            updateData.keywords = extractedKeywords
        }

        // Support audioFiles array (new format) - MERGE with existing audio files
        if (audioFiles !== undefined && audioFiles !== null && Array.isArray(audioFiles)) {
            // Validate array size
            if (audioFiles.length > 200) {
                return NextResponse.json({ error: 'Too many audio files' }, { status: 400 })
            }

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
