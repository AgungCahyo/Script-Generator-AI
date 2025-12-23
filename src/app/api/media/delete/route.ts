import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/api/auth'
import prisma from '@/lib/prisma'
import { adminStorage } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request)

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const body = await request.json()
        const { scriptId, mediaId } = body

        if (!scriptId || !mediaId) {
            return new Response(
                JSON.stringify({ error: 'scriptId and mediaId are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Verify script ownership
        const script = await prisma.script.findUnique({
            where: { id: scriptId },
            select: { userId: true, imageUrls: true }
        })

        if (!script || script.userId !== user.uid) {
            return new Response(
                JSON.stringify({ error: 'Script not found or unauthorized' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Find the media item to delete
        const mediaArray = script.imageUrls as Array<{ id: number | string; url: string }>

        const mediaItem = mediaArray?.find((item) =>
            item.id.toString() === mediaId.toString()
        )

        if (!mediaItem) {
            console.error('❌ Media not found in array!', { mediaId, arrayLength: mediaArray?.length })
            return new Response(
                JSON.stringify({ error: 'Media not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }


        // Extract Firebase Storage path from URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media
        const firebaseUrl = mediaItem.url

        if (firebaseUrl.includes('firebasestorage.googleapis.com')) {
            try {
                // Extract encoded path from URL
                const urlParts = firebaseUrl.split('/o/')

                if (urlParts.length > 1) {
                    const pathWithQuery = urlParts[1]
                    const encodedPath = pathWithQuery.split('?')[0]
                    const filePath = decodeURIComponent(encodedPath)


                    // Delete from Firebase Storage
                    const storage = adminStorage()
                    const bucket = storage.bucket()
                    const file = bucket.file(filePath)

                    await file.delete()
                } else {
                    console.error('❌ Failed to extract path from URL')
                }
            } catch (error) {
                console.error('❌ Error deleting from Firebase Storage:', error)
                // Throw error instead of continuing - we want to know if delete fails
                throw new Error(`Failed to delete from Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        } else if (firebaseUrl.includes('googleusercontent.com') || firebaseUrl.includes('drive.google.com')) {
            // Legacy Google Drive files - skip deletion (file might still be in Drive)
        } else {
            console.warn('⚠️ Unknown file URL format:', firebaseUrl)
        }

        // Remove from database
        const updatedMedia = mediaArray.filter((item) =>
            item.id.toString() !== mediaId.toString()
        )

        await prisma.script.update({
            where: { id: scriptId },
            data: { imageUrls: updatedMedia as unknown as object[] }
        })

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Media deleted successfully'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error deleting media:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
