import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl.searchParams.get('url')

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL parameter required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Validate it's a Google Drive URL
        if (!url.includes('drive.google.com')) {
            return new Response(JSON.stringify({ error: 'Only Google Drive URLs are supported' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Extract file ID from various Google Drive URL formats
        let fileId = ''
        const idMatch = url.match(/[?&]id=([^&]+)/) || url.match(/\/d\/([^/]+)/)
        if (idMatch) {
            fileId = idMatch[1]
        }

        if (!fileId) {
            return new Response(JSON.stringify({ error: 'Could not extract file ID from URL' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Use lh3.googleusercontent.com format which is more reliable for public files
        // This format works for files that are shared with "Anyone with the link"
        const downloadUrl = `https://lh3.googleusercontent.com/d/${fileId}`

        // Fetch image from Google Drive
        const response = await fetch(downloadUrl, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        })

        if (!response.ok) {
            // Try alternate URL format if first fails
            const altUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`
            const altResponse = await fetch(altUrl, {
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
            })

            if (!altResponse.ok) {
                console.error('Failed to fetch image from both URLs:', fileId, response.status, altResponse.status)
                return new Response(JSON.stringify({ error: 'Failed to fetch image', fileId }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                })
            }

            const imageBuffer = await altResponse.arrayBuffer()
            const contentType = altResponse.headers.get('Content-Type') || 'image/jpeg'

            return new Response(imageBuffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': imageBuffer.byteLength.toString(),
                    'Cache-Control': 'public, max-age=86400',
                    'Access-Control-Allow-Origin': '*',
                }
            })
        }

        // Get the image blob
        const imageBuffer = await response.arrayBuffer()
        const contentType = response.headers.get('Content-Type') || 'image/jpeg'

        // Return image with proper headers
        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': imageBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
            }
        })
    } catch (error) {
        console.error('Image proxy error:', error)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
