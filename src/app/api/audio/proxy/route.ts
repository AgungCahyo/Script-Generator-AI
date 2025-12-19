import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl.searchParams.get('url')

        if (!url) {
            return new Response('URL parameter required', { status: 400 })
        }

        // Validate it's a Google Drive URL
        if (!url.includes('drive.google.com')) {
            return new Response('Only Google Drive URLs are supported', { status: 400 })
        }

        // Fetch audio from Google Drive
        // Google Drive often redirects, so we need to follow redirects
        const response = await fetch(url, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        if (!response.ok) {
            console.error('Failed to fetch audio:', response.status, response.statusText)
            return new Response('Failed to fetch audio', { status: response.status })
        }

        // Get the audio blob
        const audioBuffer = await response.arrayBuffer()

        // Return audio with proper headers
        return new Response(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
            }
        })
    } catch (error) {
        console.error('Proxy error:', error)
        return new Response('Internal server error', { status: 500 })
    }
}
