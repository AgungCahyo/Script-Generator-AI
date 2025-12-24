'use client'

import { useState } from 'react'
import {
    ImagesOutline,
    VideocamOutline,
    Reload
} from 'react-ionicons'
import { useConfirm } from './Confirm'
import MediaSearchModal from './MediaSearchModal'
import { CREDIT_COSTS } from '@/lib/constants/credits'

interface MediaToolbarProps {
    scriptId: string
    topic: string
    hasScript: boolean
    authToken?: string
    onFetchImages: (keywords: string, count: number, orientation: string, source?: string) => Promise<void>
    onGenerateVideo: (keywords: string, count: number, orientation: string, source?: string) => Promise<void>
    fetchingImages: boolean
    generatingVideo: boolean
    extractedKeywords?: string
}

export default function MediaToolbar({
    topic,
    hasScript,
    authToken,
    onFetchImages,
    onGenerateVideo,
    fetchingImages,
    generatingVideo,
    extractedKeywords = ''
}: MediaToolbarProps) {
    const { confirm } = useConfirm()
    const [showImageModal, setShowImageModal] = useState(false)
    const [showVideoModal, setShowVideoModal] = useState(false)

    const handleOpenImageModal = () => {
        // Close video modal if open
        if (showVideoModal) setShowVideoModal(false)
        setShowImageModal(true)
    }

    const handleOpenVideoModal = () => {
        // Close image modal if open
        if (showImageModal) setShowImageModal(false)
        setShowVideoModal(true)
    }

    const handleFetchImages = async (keywords: string, count: number, orientation: string, source: string) => {
        // Calculate credits based on source
        const credits = source === 'stock'
            ? Math.ceil(count / 5) * CREDIT_COSTS.IMAGE_SEARCH_PER_5  // Stock: IMAGE_SEARCH_PER_5 credits per 5 images
            : count * 20  // AI: 20 credits per image (future)

        // Show confirmation
        const confirmed = await confirm({
            title: 'Cari Gambar',
            message: `Bakal pakai ${credits} kredit buat cari ${count} gambar ${source === 'ai' ? 'AI' : 'stock'} nih. Lanjut?`,
            confirmText: 'Ya, Cari',
            cancelText: 'Batal'
        })

        if (!confirmed) return

        setShowImageModal(false)
        await onFetchImages(keywords, count, orientation, source)
    }

    const handleFetchVideos = async (keywords: string, count: number, orientation: string, source: string) => {
        // Calculate credits based on source
        const credits = source === 'stock'
            ? count * CREDIT_COSTS.VIDEO_SEARCH  // Stock: VIDEO_SEARCH credits per video
            : count * 100  // AI: 100 credits per video (future)

        // Show confirmation
        const confirmed = await confirm({
            title: 'Cari Video',
            message: `Bakal pakai ${credits} kredit buat cari ${count} video ${source === 'ai' ? 'AI' : 'stock'} nih. Lanjut?`,
            confirmText: 'Ya, Cari',
            cancelText: 'Batal'
        })

        if (!confirmed) return

        setShowVideoModal(false)
        await onGenerateVideo(keywords, count, orientation, source)
    }

    return (
        <>
            <div className="w-px h-4 bg-neutral-200 mx-1" />

            {/* Get Images Button */}
            <button
                onClick={handleOpenImageModal}
                disabled={fetchingImages || !hasScript}
                className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Get Images"
            >
                {fetchingImages ? (
                    <>
                        <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                        <span className="hidden sm:inline">Fetching...</span>
                    </>
                ) : (
                    <>
                        <ImagesOutline color="currentColor" width="16px" height="16px" />
                        <span className="hidden sm:inline">Images</span>
                    </>
                )}
            </button>

            <div className="w-px h-4 bg-neutral-200 mx-1" />

            {/* Stock Video Search Button */}
            <button
                onClick={handleOpenVideoModal}
                disabled={generatingVideo || !hasScript}
                className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Search stock videos"
            >
                {generatingVideo ? (
                    <>
                        <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                        <span className='hidden sm:inline'>Generating...</span>
                    </>
                ) : (
                    <>
                        <VideocamOutline color="currentColor" width="16px" height="16px" />
                        <span className="hidden sm:inline">Videos</span>
                    </>
                )}
            </button>

            {/* Image Search Modal */}
            <MediaSearchModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                type="image"
                onSubmit={handleFetchImages}
                isLoading={fetchingImages}
                extractedKeywords={extractedKeywords}
                topic={topic}
            />

            {/* Video Search Modal */}
            <MediaSearchModal
                isOpen={showVideoModal}
                onClose={() => setShowVideoModal(false)}
                type="video"
                onSubmit={handleFetchVideos}
                isLoading={generatingVideo}
                extractedKeywords={extractedKeywords}
                topic={topic}
            />
        </>
    )
}
