import { useState } from 'react'
import { Script } from '../utils/types'

export interface UseScriptActionsReturn {
    saving: boolean
    handleSave: (editedScript: string, onSuccess: (updated: Script) => void, onError: (error: string) => void) => Promise<void>
    savingTitle: boolean
    handleSaveTitle: (newTitle: string, onSuccess: (updated: Script) => void, onError: (error: string) => void) => Promise<void>
    fetchingImages: boolean
    handleFetchImages: (keywords: string, count: number, orientation: string, source: string | undefined, onSuccess: (images: any[]) => void, onError: (error: string) => void) => Promise<void>
    generatingVideo: boolean
    handleGenerateVideo: (keywords: string, count: number, orientation: string, source: string | undefined, onSuccess: (videos: any[]) => void, onError: (error: string) => void) => Promise<void>
    handleDeleteMedia: (mediaId: string, onSuccess: () => void, onError: (error: string) => void) => Promise<void>
}

/**
 * Custom hook for script CRUD and media operations
 * Handles save, fetch images, generate video, and delete media
 */
export function useScriptActions(script: Script | null, authToken?: string): UseScriptActionsReturn {
    const [saving, setSaving] = useState(false)
    const [savingTitle, setSavingTitle] = useState(false)
    const [fetchingImages, setFetchingImages] = useState(false)
    const [generatingVideo, setGeneratingVideo] = useState(false)

    const handleSave = async (
        editedScript: string,
        onSuccess: (updated: Script) => void,
        onError: (error: string) => void
    ) => {
        if (!script) return

        setSaving(true)
        try {
            const res = await fetch(`/api/scripts/${script.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { Authorization: `Bearer ${authToken}` })
                },
                body: JSON.stringify({ script: editedScript })
            })
            const data = await res.json()
            if (data.script) {
                onSuccess(data.script)
            } else {
                onError(data.error || 'Failed to save script')
            }
        } catch (error) {
            console.error('Error saving script:', error)
            onError('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveTitle = async (
        newTitle: string,
        onSuccess: (updated: Script) => void,
        onError: (error: string) => void
    ) => {
        if (!script) return

        setSavingTitle(true)
        try {
            const res = await fetch(`/api/scripts/${script.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { Authorization: `Bearer ${authToken}` })
                },
                body: JSON.stringify({ topic: newTitle })
            })
            const data = await res.json()
            if (data.script) {
                onSuccess(data.script)
            } else {
                onError(data.error || 'Failed to save title')
            }
        } catch (error) {
            console.error('Error saving title:', error)
            onError('Network error. Please try again.')
        } finally {
            setSavingTitle(false)
        }
    }


    const handleFetchImages = async (
        keywords: string,
        count: number,
        orientation: string,
        source: string | undefined,
        onSuccess: (images: any[]) => void,
        onError: (error: string) => void
    ) => {
        if (!script) return

        setFetchingImages(true)
        try {
            const res = await fetch('/api/images/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { Authorization: `Bearer ${authToken}` })
                },
                body: JSON.stringify({
                    scriptId: script.id,
                    keywords,
                    count,
                    orientation,
                    source: source || 'pexels'
                })
            })
            const data = await res.json()

            // Handle 402 Payment Required (insufficient credits)
            if (res.status === 402) {
                onError(data.message || 'Insufficient credits for image search')
                return
            }

            if (data.success) {
                // Images will arrive via callback, just acknowledge the request started
                onSuccess([]) // Empty array initially, callback will update
            } else {
                onError(data.error || 'Failed to fetch images')
            }
        } catch (error) {
            console.error('Error fetching images:', error)
            onError('Network error. Please try again.')
        } finally {
            setFetchingImages(false)
        }
    }

    const handleGenerateVideo = async (
        keywords: string,
        count: number,
        orientation: string,
        source: string | undefined,
        onSuccess: (videos: any[]) => void,
        onError: (error: string) => void
    ) => {
        if (!script) return

        setGeneratingVideo(true)
        try {
            const res = await fetch('/api/videos/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { Authorization: `Bearer ${authToken}` })
                },
                body: JSON.stringify({
                    scriptId: script.id,
                    keywords,
                    count,
                    orientation,
                    source: source || 'pexels'
                })
            })
            const data = await res.json()

            // Handle 402 Payment Required (insufficient credits)
            if (res.status === 402) {
                onError(data.message || 'Insufficient credits for video search')
                return
            }

            if (data.success) {
                // Videos will arrive via callback, just acknowledge the request started
                onSuccess([]) // Empty array initially, callback will update
            } else {
                onError(data.error || 'Failed to search videos')
            }
        } catch (error) {
            console.error('Error searching videos:', error)
            onError('Network error. Please try again.')
        } finally {
            setGeneratingVideo(false)
        }
    }

    const handleDeleteMedia = async (
        mediaId: string,
        onSuccess: () => void,
        onError: (error: string) => void
    ) => {
        if (!script) return

        try {
            const res = await fetch(`/api/media/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { Authorization: `Bearer ${authToken}` })
                },
                body: JSON.stringify({
                    scriptId: script.id,
                    mediaId
                })
            })
            const data = await res.json()
            if (data.success) {
                onSuccess()
            } else {
                onError(data.error || 'Failed to delete media')
            }
        } catch (error) {
            console.error('Error deleting media:', error)
            onError('Network error. Please try again.')
        }
    }

    return {
        saving,
        handleSave,
        savingTitle,
        handleSaveTitle,
        fetchingImages,
        handleFetchImages,
        generatingVideo,
        handleGenerateVideo,
        handleDeleteMedia
    }
}
