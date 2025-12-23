'use client'

import { useState } from 'react'
import { PexelsImage } from '@/lib/types/pexels'
import {
    ImagesOutline,
    DownloadOutline,
    VideocamOutline,
    PlayCircleOutline,
    TrashOutline,
    ChevronDownOutline,
    ChevronUpOutline,
    CloudDownloadOutline,
    SyncOutline,
    CameraOutline,
    CheckmarkCircle,
    CheckmarkCircleOutline,
    ExpandOutline,
    CheckboxOutline,
    CloseOutline
} from 'react-ionicons'
import { useConfirm } from './Confirm'
import { ImagePreviewModal } from './ImagePreviewModal'
import { VideoPreviewModal } from './VideoPreviewModal'

interface MediaGalleryProps {
    images: PexelsImage[]
    videos: (PexelsImage & { type?: string; driveFileId?: string })[]
    onDeleteMedia: (mediaId: string) => Promise<void>
    isEditing?: boolean
    fetchingImages?: boolean
}

export default function MediaGallery({
    images,
    videos,
    onDeleteMedia,
    isEditing = false,
    fetchingImages = false
}: MediaGalleryProps) {
    const { confirm } = useConfirm()
    const [imagesExpanded, setImagesExpanded] = useState(true)
    const [videosExpanded, setVideosExpanded] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const [downloadingAll, setDownloadingAll] = useState(false)

    // Selection and preview states for images
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [previewImage, setPreviewImage] = useState<{ url: string; alt: string; photographer?: string; downloadUrl?: string } | null>(null)
    const [previewVideo, setPreviewVideo] = useState<{ url: string; alt: string; photographer?: string; downloadUrl?: string } | null>(null)
    const [bulkDeleting, setBulkDeleting] = useState(false)
    const [bulkDownloading, setBulkDownloading] = useState(false)
    const [downloadingPreview, setDownloadingPreview] = useState(false)

    // Selection states for videos
    const [videoSelectMode, setVideoSelectMode] = useState(false)
    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set())
    const [bulkDeletingVideos, setBulkDeletingVideos] = useState(false)
    const [bulkDownloadingVideos, setBulkDownloadingVideos] = useState(false)

    if (isEditing || (!fetchingImages && images.length === 0 && videos.length === 0)) {
        return null
    }

    const getMediaId = (image: PexelsImage, index: number) =>
        String(image.id) || (image as PexelsImage & { driveFileId?: string }).driveFileId || `img_${index}`

    const getVideoId = (video: PexelsImage & { type?: string; driveFileId?: string }, index: number) =>
        String(video.id) || video.driveFileId || `video_${index}`

    const toggleSelect = (mediaId: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(mediaId)) {
            newSelected.delete(mediaId)
        } else {
            newSelected.add(mediaId)
        }
        setSelectedIds(newSelected)
    }

    const selectAll = () => {
        const allIds = images.map((img, idx) => getMediaId(img, idx))
        setSelectedIds(new Set(allIds))
    }

    const deselectAll = () => setSelectedIds(new Set())

    const exitSelectMode = () => {
        setSelectMode(false)
        setSelectedIds(new Set())
    }

    // Video selection handlers
    const toggleSelectVideo = (mediaId: string) => {
        const newSelected = new Set(selectedVideoIds)
        if (newSelected.has(mediaId)) {
            newSelected.delete(mediaId)
        } else {
            newSelected.add(mediaId)
        }
        setSelectedVideoIds(newSelected)
    }

    const selectAllVideos = () => {
        const allIds = videos.map((video, idx) => getVideoId(video, idx))
        setSelectedVideoIds(new Set(allIds))
    }

    const deselectAllVideos = () => setSelectedVideoIds(new Set())

    const exitVideoSelectMode = () => {
        setVideoSelectMode(false)
        setSelectedVideoIds(new Set())
    }

    const handleDelete = async (mediaId: string) => {
        setDeletingId(mediaId)
        try {
            await onDeleteMedia(mediaId)
        } finally {
            setDeletingId(null)
        }
    }

    const handleDownload = async (url: string, filename: string, mediaId: string) => {
        setDownloadingId(mediaId)
        if (mediaId === 'preview' || mediaId === 'video_preview') {
            setDownloadingPreview(true)
        }
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(downloadUrl)
        } catch (error) {
            window.open(url, '_blank')
        } finally {
            setDownloadingId(null)
            setDownloadingPreview(false)
        }
    }

    const handleDownloadAll = async () => {
        setDownloadingAll(true)
        try {
            for (let i = 0; i < images.length; i++) {
                const image = images[i]
                const downloadUrl = image.downloadUrl?.includes('drive.google.com')
                    ? `/api/images/proxy?url=${encodeURIComponent(image.downloadUrl)}`
                    : image.downloadUrl
                if (downloadUrl) {
                    await handleDownload(downloadUrl, `image_${i + 1}.jpg`, `all_${i}`)
                    await new Promise(resolve => setTimeout(resolve, 500))
                }
            }
        } finally {
            setDownloadingAll(false)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return
        const confirmed = await confirm({
            title: `Delete ${selectedIds.size} images?`,
            message: 'This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger'
        })
        if (!confirmed) return
        setBulkDeleting(true)
        try {
            for (const mediaId of selectedIds) {
                await onDeleteMedia(mediaId)
            }
            exitSelectMode()
        } finally {
            setBulkDeleting(false)
        }
    }

    const handleBulkDownload = async () => {
        if (selectedIds.size === 0) return
        setBulkDownloading(true)
        try {
            let downloadIndex = 0
            for (let i = 0; i < images.length; i++) {
                const image = images[i]
                const mediaId = getMediaId(image, i)
                if (selectedIds.has(mediaId)) {
                    const downloadUrl = image.downloadUrl?.includes('drive.google.com')
                        ? `/api/images/proxy?url=${encodeURIComponent(image.downloadUrl)}`
                        : image.downloadUrl
                    if (downloadUrl) {
                        downloadIndex++
                        await handleDownload(downloadUrl, `image_${downloadIndex}.jpg`, mediaId)
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                }
            }
        } finally {
            setBulkDownloading(false)
        }
    }

    // Video bulk operations
    const handleBulkDeleteVideos = async () => {
        if (selectedVideoIds.size === 0) return
        const confirmed = await confirm({
            title: `Delete ${selectedVideoIds.size} videos?`,
            message: 'This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger'
        })
        if (!confirmed) return
        setBulkDeletingVideos(true)
        try {
            for (const mediaId of selectedVideoIds) {
                await onDeleteMedia(mediaId)
            }
            exitVideoSelectMode()
        } finally {
            setBulkDeletingVideos(false)
        }
    }

    const handleBulkDownloadVideos = async () => {
        if (selectedVideoIds.size === 0) return
        setBulkDownloadingVideos(true)
        try {
            let downloadIndex = 0
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i]
                const mediaId = getVideoId(video, i)
                if (selectedVideoIds.has(mediaId)) {
                    const downloadUrl = video.downloadUrl || video.url || ''
                    if (downloadUrl) {
                        downloadIndex++
                        await handleDownload(downloadUrl, `video_${downloadIndex}.mp4`, mediaId)
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                }
            }
        } finally {
            setBulkDownloadingVideos(false)
        }
    }

    return (
        <>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {/* Images Gallery */}
                {(images.length > 0 || fetchingImages) && (
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-neutral-50">
                            <button
                                onClick={() => setImagesExpanded(!imagesExpanded)}
                                className="flex items-center gap-1.5 sm:gap-2 hover:bg-neutral-100 rounded px-1.5 sm:px-2 py-1 -ml-1.5 sm:-ml-2 transition-colors"
                            >
                                <h2 className="text-xs sm:text-sm font-medium text-neutral-700 flex items-center gap-1.5 sm:gap-2">
                                    <ImagesOutline color="currentColor" width="14px" height="14px" />
                                    <span className="hidden sm:inline">Images</span> ({images.length})
                                </h2>
                                {imagesExpanded ? (
                                    <ChevronUpOutline color="currentColor" width="14px" height="14px" />
                                ) : (
                                    <ChevronDownOutline color="currentColor" width="14px" height="14px" />
                                )}
                            </button>

                            <div className="flex items-center gap-1 sm:gap-2">
                                {selectMode ? (
                                    <>
                                        <span className="text-xs text-neutral-500 hidden sm:inline">{selectedIds.size} dipilih</span>
                                        <button onClick={selectedIds.size === images.length ? deselectAll : selectAll} className="p-1.5 hover:bg-neutral-200 rounded transition-colors" title={selectedIds.size === images.length ? "Batalkan semua" : "Pilih semua"}>
                                            {selectedIds.size === images.length ? <CheckmarkCircle color="#000" width="16px" height="16px" /> : <CheckmarkCircleOutline color="#525252" width="16px" height="16px" />}
                                        </button>
                                        <button onClick={handleBulkDownload} disabled={selectedIds.size === 0 || bulkDownloading} className="p-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors" title="Download yang dipilih">
                                            {bulkDownloading ? <SyncOutline color="#fff" width="14px" height="14px" cssClasses="animate-spin" /> : <DownloadOutline color="#fff" width="14px" height="14px" />}
                                        </button>
                                        <button onClick={handleBulkDelete} disabled={selectedIds.size === 0 || bulkDeleting} className="p-1.5 bg-black text-white rounded hover:bg-black/80 disabled:opacity-50 transition-colors" title="Hapus yang dipilih">
                                            {bulkDeleting ? <SyncOutline color="#fff" width="14px" height="14px" cssClasses="animate-spin" /> : <TrashOutline color="#fff" width="14px" height="14px" />}
                                        </button>
                                        <button onClick={exitSelectMode} className="p-1.5 hover:bg-neutral-200 rounded transition-colors" title="Keluar mode pilih">
                                            <CloseOutline color="#525252" width="16px" height="16px" />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setSelectMode(true)} className="p-1.5 hover:bg-neutral-200 rounded transition-colors" title="Mode pilih">
                                        <CheckboxOutline color="#525252" width="16px" height="16px" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {imagesExpanded && (
                            <div className="p-2 sm:p-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                    {fetchingImages && [...Array(3)].map((_, i) => (
                                        <div key={`skeleton-${i}`} className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100 animate-pulse">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <SyncOutline color="#a3a3a3" width="24px" height="24px" cssClasses="animate-spin" />
                                                    <span className="text-xs text-neutral-400">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {images.map((image, index) => {
                                        const proxyUrl = image.url?.includes('drive.google.com') ? `/api/images/proxy?url=${encodeURIComponent(image.url)}` : image.url
                                        const downloadProxyUrl = image.downloadUrl?.includes('drive.google.com') ? `/api/images/proxy?url=${encodeURIComponent(image.downloadUrl)}` : image.downloadUrl
                                        const mediaId = getMediaId(image, index)
                                        const isDeleting = deletingId === mediaId
                                        const isDownloading = downloadingId === mediaId
                                        const isSelected = selectedIds.has(mediaId)

                                        return (
                                            <div
                                                key={`${image.id || 'img'}-${index}`}
                                                className={`relative group aspect-video rounded-lg overflow-hidden bg-neutral-100 cursor-pointer ${isSelected ? 'ring-2 ring-neutral-900' : ''}`}
                                                onClick={() => selectMode ? toggleSelect(mediaId) : setPreviewImage({ url: proxyUrl, alt: image.alt || `Image ${index + 1}`, photographer: image.photographer, downloadUrl: downloadProxyUrl })}
                                            >
                                                <img src={proxyUrl} alt={image.alt || `Image ${index + 1}`} className={`w-full h-full object-cover transition-opacity ${isDeleting ? 'opacity-50' : ''}`} loading="lazy" />

                                                {selectMode && (
                                                    <div className="absolute top-2 left-2">
                                                        {isSelected ? <CheckmarkCircle color="#000" width="20px" height="20px" /> : <CheckmarkCircleOutline color="#fff" width="20px" height="20px" />}
                                                    </div>
                                                )}

                                                {isDeleting && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <span className="text-white text-xs animate-pulse">Deleting...</span>
                                                    </div>
                                                )}

                                                {image.photographer && !isDeleting && (
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/60 to-transparent">
                                                        <p className="text-[10px] flex items-center gap-1 text-white truncate">
                                                            <CameraOutline color="#fff" width="12px" height="12px" />
                                                            {image.photographer}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Videos Gallery */}
                {videos.length > 0 && (
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-neutral-50">
                            <button
                                onClick={() => setVideosExpanded(!videosExpanded)}
                                className="flex items-center gap-1.5 sm:gap-2 hover:bg-neutral-100 rounded px-1.5 sm:px-2 py-1 -ml-1.5 sm:-ml-2 transition-colors"
                            >
                                <h2 className="text-xs sm:text-sm font-medium text-neutral-700 flex items-center gap-1.5 sm:gap-2">
                                    <VideocamOutline color="currentColor" width="14px" height="14px" />
                                    <span className="hidden sm:inline">Videos</span> ({videos.length})
                                </h2>
                                {videosExpanded ? <ChevronUpOutline color="currentColor" width="14px" height="14px" /> : <ChevronDownOutline color="currentColor" width="14px" height="14px" />}
                            </button>

                            <div className="flex items-center gap-1 sm:gap-2">
                                {videoSelectMode ? (
                                    <>
                                        <span className="text-xs text-neutral-500 hidden sm:inline">{selectedVideoIds.size} dipilih</span>
                                        <button onClick={selectedVideoIds.size === videos.length ? deselectAllVideos : selectAllVideos} className="p-1.5 hover:bg-neutral-200 rounded transition-colors" title={selectedVideoIds.size === videos.length ? "Batalkan semua" : "Pilih semua"}>
                                            {selectedVideoIds.size === videos.length ? <CheckmarkCircle color="#000" width="16px" height="16px" /> : <CheckmarkCircleOutline color="#525252" width="16px" height="16px" />}
                                        </button>
                                        <button onClick={handleBulkDownloadVideos} disabled={selectedVideoIds.size === 0 || bulkDownloadingVideos} className="p-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors" title="Download yang dipilih">
                                            {bulkDownloadingVideos ? <SyncOutline color="#fff" width="14px" height="14px" cssClasses="animate-spin" /> : <DownloadOutline color="#fff" width="14px" height="14px" />}
                                        </button>
                                        <button onClick={handleBulkDeleteVideos} disabled={selectedVideoIds.size === 0 || bulkDeletingVideos} className="p-1.5 bg-black text-white rounded hover:bg-black/80 disabled:opacity-50 transition-colors" title="Hapus yang dipilih">
                                            {bulkDeletingVideos ? <SyncOutline color="#fff" width="14px" height="14px" cssClasses="animate-spin" /> : <TrashOutline color="#fff" width="14px" height="14px" />}
                                        </button>
                                        <button onClick={exitVideoSelectMode} className="p-1.5 hover:bg-neutral-200 rounded transition-colors" title="Keluar mode pilih">
                                            <CloseOutline color="#525252" width="16px" height="16px" />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setVideoSelectMode(true)} className="p-1.5 hover:bg-neutral-200 rounded transition-colors" title="Mode pilih">
                                        <CheckboxOutline color="#525252" width="16px" height="16px" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {videosExpanded && (
                            <div className="p-2 sm:p-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                    {videos.map((video, index) => {
                                        const mediaId = getVideoId(video, index)
                                        const isDeleting = deletingId === mediaId
                                        const isDownloading = downloadingId === mediaId
                                        const videoUrl = video.url || ''
                                        const downloadUrl = video.downloadUrl || ''
                                        const thumbnailUrl = (video as any).thumbnail || video.url || ''
                                        const isSelected = selectedVideoIds.has(mediaId)

                                        return (
                                            <div
                                                key={`video-${index}`}
                                                className={`relative group aspect-video rounded-lg overflow-hidden bg-neutral-900 cursor-pointer ${isSelected ? 'ring-2 ring-neutral-900' : ''}`}
                                                onClick={() => videoSelectMode ? toggleSelectVideo(mediaId) : (!isDeleting && setPreviewVideo({ url: videoUrl, alt: video.alt || `Video ${index + 1}`, photographer: video.photographer, downloadUrl }))}
                                            >
                                                {/* Video thumbnail */}
                                                {thumbnailUrl ? (
                                                    <img
                                                        src={thumbnailUrl}
                                                        alt={video.alt || `Video ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-neutral-800 to-neutral-900">
                                                        <VideocamOutline color="#fff" width="32px" height="32px" cssClasses="opacity-50" />
                                                    </div>
                                                )}

                                                {/* Play icon overlay */}
                                                {!videoSelectMode && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="bg-black/40 rounded-full p-3">
                                                            <PlayCircleOutline color="#fff" width="48px" height="48px" cssClasses="opacity-90" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Selection checkbox */}
                                                {videoSelectMode && (
                                                    <div className="absolute top-2 left-2 z-10">
                                                        {isSelected ? <CheckmarkCircle color="#000" width="20px" height="20px" /> : <CheckmarkCircleOutline color="#fff" width="20px" height="20px" />}
                                                    </div>
                                                )}

                                                {isDeleting && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                                        <span className="text-white text-xs animate-pulse">Deleting...</span>
                                                    </div>
                                                )}

                                                {video.photographer && !isDeleting && (
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/60 to-transparent">
                                                        <p className="text-[10px] flex items-center gap-1 text-white truncate">
                                                            <VideocamOutline color="#fff" width="12px" height="12px" />
                                                            {video.photographer}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreviewModal
                    imageUrl={previewImage.url}
                    alt={previewImage.alt}
                    photographer={previewImage.photographer}
                    onClose={() => setPreviewImage(null)}
                    onDownload={previewImage.downloadUrl ? () => {
                        handleDownload(previewImage.downloadUrl!, 'image.jpg', 'preview')
                    } : undefined}
                    isDownloading={downloadingPreview}
                />
            )}

            {/* Video Preview Modal */}
            {previewVideo && (
                <VideoPreviewModal
                    videoUrl={previewVideo.url}
                    title={previewVideo.alt}
                    onClose={() => setPreviewVideo(null)}
                    onDownload={previewVideo.downloadUrl ? () => {
                        handleDownload(previewVideo.downloadUrl!, 'video.mp4', 'video_preview')
                    } : undefined}
                    isDownloading={downloadingPreview}
                />
            )}
        </>
    )
}
