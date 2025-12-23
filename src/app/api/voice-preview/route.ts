import { NextRequest, NextResponse } from 'next/server'

/**
 * @deprecated This endpoint is deprecated as of 2025-12-23
 * Voice previews now use static audio files from /public/voice-samples/
 * This saves API costs and improves performance.
 * Kept for backward compatibility only.
 */

// GET: Generate TTS preview for a voice
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const voice = searchParams.get('voice') || 'alloy'
        const text = searchParams.get('text') || 'This is a voice preview.'

        // Call OpenAI TTS API
        const openaiApiKey = process.env.OPENAI_API_KEY
        if (!openaiApiKey) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            )
        }

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: voice,
                input: text,
                speed: 1.0
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('OpenAI TTS error:', errorData)
            return NextResponse.json(
                { error: 'Failed to generate voice preview' },
                { status: response.status }
            )
        }

        // Get the audio data
        const audioBuffer = await response.arrayBuffer()

        // Return audio file
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        })
    } catch (error) {
        console.error('Voice preview error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
