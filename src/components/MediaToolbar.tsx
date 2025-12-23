'use client'

import { useState, useRef, useEffect } from 'react'
import {
    ImagesOutline,
    VideocamOutline,
    Reload,
    PhoneLandscape,
    PhoneLandscapeOutline,
    PhonePortraitOutline
} from 'react-ionicons'
import { useToast } from './Toast'
import { useConfirm } from './Confirm'
import CustomDropdown from './CustomDropdown'
import { DropdownOption } from '@/lib/constants/models'

const VIDEO_DURATION_OPTIONS = [4, 5, 6, 7, 8]

const IMAGE_SOURCE_OPTIONS: DropdownOption[] = [
    { value: 'pexels', label: 'Popular', description: 'Trending & widely-used' },
    { value: 'pixabay', label: 'Unique', description: 'Distinctive & creative' }
]

const VIDEO_SOURCE_OPTIONS: DropdownOption[] = [
    { value: 'pexels', label: 'Popular', description: 'High-quality footage' },
    { value: 'pixabay', label: 'Unique', description: 'Exclusive selections' }
]

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
    onFetchImages,
    onGenerateVideo,
    fetchingImages,
    generatingVideo,
    extractedKeywords = ''
}: MediaToolbarProps) {
    const { showWarning } = useToast()
    const { confirm } = useConfirm()
    const [showImagePanel, setShowImagePanel] = useState(false)
    const [imageKeywords, setImageKeywords] = useState('')
    const [customImageCount, setCustomImageCount] = useState('5')
    const [isVideoMenuOpen, setIsVideoMenuOpen] = useState(false)
    const [videoSource, setVideoSource] = useState('pexels')
    const [videoKeywords, setVideoKeywords] = useState('')
    const [customVideoCount, setCustomVideoCount] = useState('3')
    const [orientation, setOrientation] = useState('landscape')
    const [imageSource, setImageSource] = useState<'pexels' | 'pixabay'>('pexels')
    const panelRef = useRef<HTMLDivElement>(null)
    const videoMenuRef = useRef<HTMLDivElement>(null)

    // Close panels when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setShowImagePanel(false)
            }
            if (videoMenuRef.current && !videoMenuRef.current.contains(event.target as Node)) {
                setIsVideoMenuOpen(false)
            }
        }

        if (showImagePanel || isVideoMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showImagePanel, isVideoMenuOpen])

    const handleOpenImagePanel = () => {
        // Close video panel if open
        if (isVideoMenuOpen) setIsVideoMenuOpen(false)

        setShowImagePanel(!showImagePanel)
        // Prioritize extracted keywords from script, fallback to topic
        if (!imageKeywords) {
            if (extractedKeywords) {
                setImageKeywords(extractedKeywords)
            } else if (topic) {
                setImageKeywords(topic)
            }
        }
    }

    const handleOpenVideoPanel = () => {
        // Close image panel if open
        if (showImagePanel) setShowImagePanel(false)

        setIsVideoMenuOpen(!isVideoMenuOpen)
        // Set keywords if empty
        if (!videoKeywords) {
            if (extractedKeywords) {
                setVideoKeywords(extractedKeywords)
            } else if (topic) {
                setVideoKeywords(topic)
            }
        }
    }

    const handleFetchVideos = async () => {
        if (!videoKeywords.trim()) return
        const count = parseInt(customVideoCount) || 3
        const credits = count * 2

        // Show confirmation
        const confirmed = await confirm({
            title: 'Cari Video',
            message: `Bakal pakai ${credits} kredit buat cari ${count} video${count > 1 ? '' : ''}. Lanjut?`,
            confirmText: 'Ya, Cari',
            cancelText: 'Batal'
        })

        if (!confirmed) return

        setIsVideoMenuOpen(false)
        await onGenerateVideo(videoKeywords.trim(), count, orientation, videoSource)
        setVideoKeywords('')
    }

    const handleFetchImages = async () => {
        if (!imageKeywords.trim()) return

        const count = parseInt(customImageCount) || 5
        const credits = Math.ceil(count / 5)

        // Show confirmation
        const confirmed = await confirm({
            title: 'Cari Gambar',
            message: `Bakal pakai ${credits} kredit buat cari ${count} gambar nih. Lanjut?`,
            confirmText: 'Ya, Cari',
            cancelText: 'Batal'
        })

        if (!confirmed) return

        await onFetchImages(imageKeywords.trim(), count, orientation, imageSource)
        setShowImagePanel(false)
    }

    return (
        <>
            <div className="w-px h-4 bg-neutral-200 mx-1" />

            {/* Get Images Button */}
            <div className="relative">
                <button
                    onClick={handleOpenImagePanel}
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

                {showImagePanel && (
                    <div ref={panelRef} className="absolute top-full right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 p-2.5 sm:p-3 w-56 sm:w-64">
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                            Search Keywords
                        </label>
                        <input
                            type="text"
                            value={imageKeywords}
                            onChange={(e) => setImageKeywords(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFetchImages()}
                            placeholder="e.g. mountain landscape, city night"
                            className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-400 mb-2.5"
                        />

                        <CustomDropdown
                            label="Source"
                            value={imageSource}
                            onChange={(value) => setImageSource(value as 'pexels' | 'pixabay')}
                            options={IMAGE_SOURCE_OPTIONS}
                        />
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                            Orientation
                        </label>
                        <div className="flex gap-1 mb-3">
                            <button
                                type="button"
                                onClick={() => setOrientation('landscape')}
                                className={`flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium rounded transition-colors ${orientation === 'landscape'
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                            >
                                <PhoneLandscapeOutline color={orientation === 'landscape' ? '#fff' : '#525252'} width="20px" height="18px" />
                                <span>Landscape</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrientation('portrait')}
                                className={`flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium rounded transition-colors ${orientation === 'portrait'
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                            >
                                <PhonePortraitOutline color={orientation === 'portrait' ? '#fff' : '#525252'} width="18px" height="18px" />
                                <span>Portrait</span>
                            </button>
                        </div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                            Number of Images
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="number"
                                min="1"
                                max="15"
                                value={customImageCount}
                                onChange={(e) => setCustomImageCount(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            />
                            <span className="text-[10px] text-neutral-400 self-center">(1-20)</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mb-3">
                            Images will be added to existing ones
                        </p>
                        <button
                            onClick={handleFetchImages}
                            disabled={!imageKeywords.trim()}
                            className="w-full px-3 py-2 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors"
                        >
                            Fetch Images <span className="text-[10px] opacity-75">(1 credit / 5 images)</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="w-px h-4 bg-neutral-200 mx-1" />

            {/* Stock Video Search Button */}
            <div className="relative">
                <button
                    onClick={handleOpenVideoPanel}
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

                {/* Video Search Dropdown */}
                {isVideoMenuOpen && (
                    <div ref={videoMenuRef} className="absolute top-full right-0 mt-1 w-56 sm:w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 p-2.5 sm:p-3">
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                            Video Source
                        </label>
                        <CustomDropdown
                            value={videoSource}
                            onChange={setVideoSource}
                            options={VIDEO_SOURCE_OPTIONS}
                            placeholder="Select source"
                        />
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5 mt-3">
                            Keywords
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., nature, city, people"
                            value={videoKeywords}
                            onChange={(e) => setVideoKeywords(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFetchVideos()}
                            className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 mb-3"
                        />
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                            Orientation
                        </label>
                        <div className="flex gap-1 mb-3">
                            <button
                                type="button"
                                onClick={() => setOrientation('landscape')}
                                className={`flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium rounded transition-colors ${orientation === 'landscape'
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                            >
                                <PhoneLandscapeOutline color={orientation === 'landscape' ? '#fff' : '#525252'} width="20px" height="18px" />
                                <span>Landscape</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrientation('portrait')}
                                className={`flex-1 flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium rounded transition-colors ${orientation === 'portrait'
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                            >
                                <PhonePortraitOutline color={orientation === 'portrait' ? '#fff' : '#525252'} width="18px" height="18px" />
                                <span>Portrait</span>
                            </button>
                        </div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                            Number of Videos
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={customVideoCount}
                                onChange={(e) => setCustomVideoCount(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            />
                            <span className="text-[10px] text-neutral-400 self-center">(1-10)</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mb-3">
                            Videos will be added to existing ones
                        </p>
                        <button
                            onClick={handleFetchVideos}
                            disabled={!videoKeywords.trim() || generatingVideo}
                            className="w-full px-3 py-2 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors flex items-center justify-center gap-2"
                        >
                            {generatingVideo ? (
                                <>
                                    <Reload color="currentColor" width="14px" height="14px" cssClasses="animate-spin" />
                                    <span>Fetching...</span>
                                </>
                            ) : (
                                <>
                                    <span>Fetch Videos</span>
                                    <span className="text-[10px] opacity-75">(2 credits / video)</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
