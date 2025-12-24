'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
    CloseOutline,
    PhoneLandscapeOutline,
    PhonePortraitOutline,
    Reload,
    InformationCircleOutline
} from 'react-ionicons'
import CustomDropdown from './CustomDropdown'
import { DropdownOption } from '@/lib/constants/models'
import { CREDIT_COSTS } from '@/lib/constants/credits'
import CoinIcon from '@/components/icons/CoinIcon'

const IMAGE_SOURCE_OPTIONS: DropdownOption[] = [
    { value: 'pexels', label: 'Popular', description: 'Trending & widely-used' },
    { value: 'pixabay', label: 'Unique', description: 'Distinctive & creative' },
    // { value: 'ai', label: '🎨 AI Generated', description: 'DALL-E 3 (2 kredit/gambar)' }
]

const VIDEO_SOURCE_OPTIONS: DropdownOption[] = [
    { value: 'pexels', label: 'Popular', description: 'High-quality footage' },
    { value: 'pixabay', label: 'Unique', description: 'Exclusive selections' },
    // { value: 'ai', label: '🎨 AI Generated', description: 'Sora-2 (20 kredit/video)' }
]

interface MediaSearchModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'image' | 'video'
    onSubmit: (keywords: string, count: number, orientation: string, source: string) => Promise<void>
    isLoading: boolean
    extractedKeywords?: string
    topic?: string
}

export default function MediaSearchModal({
    isOpen,
    onClose,
    type,
    onSubmit,
    isLoading,
    extractedKeywords = '',
    topic = ''
}: MediaSearchModalProps) {
    const [inputValue, setInputValue] = useState('') // For typing new keywords
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]) // Selected keyword tags
    const [count, setCount] = useState(type === 'image' ? '5' : '3')
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')
    const [source, setSource] = useState('pexels')
    const [isMounted, setIsMounted] = useState(false)

    // Parse extracted keywords into array
    const suggestedKeywords = extractedKeywords
        ? extractedKeywords.split(',').map(k => k.trim()).filter(Boolean)
        : topic
            ? [topic]
            : []

    // Mount animation and initialize selected keywords
    useEffect(() => {
        if (isOpen) {
            setIsMounted(true)
            // Auto-select first 3 suggested keywords
            if (suggestedKeywords.length > 0) {
                setSelectedKeywords(suggestedKeywords.slice(0, 3))
            }
            setInputValue('')
        } else {
            setTimeout(() => setIsMounted(false), 300) // Wait for animation
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    const handleSubmit = async () => {
        // Combine selected keywords + typed input
        const allKeywords = [...selectedKeywords]
        if (inputValue.trim()) {
            allKeywords.push(inputValue.trim())
        }

        if (allKeywords.length === 0) return

        const keywordsString = allKeywords.join(', ')
        const parsedCount = parseInt(count) || (type === 'image' ? 5 : 3)

        // Always single API call - loop handled in parent component for AI
        await onSubmit(keywordsString, parsedCount, orientation, source)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey) {
                // Ctrl+Enter to submit
                handleSubmit()
            } else if (inputValue.trim()) {
                // Enter to add current input as tag
                e.preventDefault()
                setSelectedKeywords([...selectedKeywords, inputValue.trim()])
                setInputValue('')
            }
        } else if (e.key === 'Backspace' && inputValue === '' && selectedKeywords.length > 0) {
            // Backspace on empty input removes last tag
            setSelectedKeywords(selectedKeywords.slice(0, -1))
        }
    }

    const addKeyword = (keyword: string) => {
        if (!selectedKeywords.includes(keyword)) {
            setSelectedKeywords([...selectedKeywords, keyword])
        }
    }

    const removeKeyword = (keyword: string) => {
        setSelectedKeywords(selectedKeywords.filter(k => k !== keyword))
    }

    if (!isOpen && !isMounted) return null

    // AI images and videos have different limits and costs
    const isAIImage = type === 'image' && source === 'ai'
    const isAIVideo = type === 'video' && source === 'ai'
    const maxCount = isAIImage
        ? 5  // Max 5 AI images
        : isAIVideo
            ? 1  // Max 1 AI video (very expensive!)
            : type === 'image' ? 20 : 10

    const estimatedCredits = isAIImage
        ? (parseInt(count) || 1) * 20  // AI: 20 credits per image (future)
        : isAIVideo
            ? (parseInt(count) || 1) * 100  // AI: 100 credits per video (future)
            : type === 'image'
                ? Math.ceil((parseInt(count) || 5) / 5) * CREDIT_COSTS.IMAGE_SEARCH_PER_5  // Stock images: IMAGE_SEARCH_PER_5 per 5 images
                : (parseInt(count) || 3) * CREDIT_COSTS.VIDEO_SEARCH  // Videos: VIDEO_SEARCH per video

    // Render modal using Portal to avoid z-index issues with parent modals
    return typeof document !== 'undefined'
        ? createPortal(
            <div
                className={`fixed inset-0 z-100 flex items-center justify-center transition-opacity duration-300 ${isOpen && isMounted ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div
                    className={`relative w-full max-w-md max-h-[90vh] mx-4 bg-white rounded-xl shadow-2xl transition-all duration-300 ease-out flex flex-col ${isOpen && isMounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                        }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            {type === 'image' ? 'Cari Gambar' : 'Cari Video'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <CloseOutline color="currentColor" width="20px" height="20px" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                        {/* Keywords/Prompt Section */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                {isAIImage ? 'Prompt' : 'Keywords'}
                            </label>

                            {/* Suggested Keywords */}
                            {suggestedKeywords.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-neutral-500 mb-2">Rekomendasi keyword (klik buat nambahin):</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {suggestedKeywords.map((keyword) => (
                                            <button
                                                key={keyword}
                                                type="button"
                                                onClick={() => addKeyword(keyword)}
                                                disabled={selectedKeywords.includes(keyword)}
                                                className={`px-2 py-1 text-xs font-medium rounded transition-all ${selectedKeywords.includes(keyword)
                                                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                                    : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 cursor-pointer'
                                                    }`}
                                            >
                                                {keyword}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Keywords + Input */}
                            <div className="min-h-[90px] px-3 py-2.5 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-neutral-900 focus-within:border-transparent bg-white">
                                <div className="flex flex-wrap gap-1.5">
                                    {/* Selected keyword tags */}
                                    {selectedKeywords.map((keyword) => (
                                        <span
                                            key={keyword}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-900 text-white text-xs font-medium rounded"
                                        >
                                            <span>{keyword}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeKeyword(keyword)}
                                                className="ml-0.5 hover:bg-neutral-700 rounded-sm p-0.5 transition-colors"
                                                aria-label={`Remove ${keyword}`}
                                            >
                                                <CloseOutline color="currentColor" width="10px" height="10px" />
                                            </button>
                                        </span>
                                    ))}

                                    {/* Input for typing new keywords */}
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={selectedKeywords.length === 0
                                            ? isAIImage
                                                ? "Describe gambar yang mau di-generate..."
                                                : "Ketik terus enter ya..."
                                            : ""}
                                        className="flex-1 min-w-[100px] text-sm outline-none bg-transparent placeholder:text-neutral-400"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <p className="mt-1.5 text-xs text-neutral-500">
                                Enter buat nambah • Backspace buat hapus • Ctrl+Enter buat kirim
                            </p>
                        </div>

                        {/* Sumber */}
                        <div>
                            <CustomDropdown
                                label="Sumber"
                                value={source}
                                onChange={setSource}
                                options={type === 'image' ? IMAGE_SOURCE_OPTIONS : VIDEO_SOURCE_OPTIONS}
                            />
                        </div>

                        {/* Orientasi */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Orientasi
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setOrientation('landscape')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${orientation === 'landscape'
                                        ? 'bg-neutral-900 text-white shadow-sm'
                                        : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                                        }`}
                                >
                                    <PhoneLandscapeOutline
                                        color={orientation === 'landscape' ? '#fff' : '#404040'}
                                        width="20px"
                                        height="20px"
                                    />
                                    <span>Landscape</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOrientation('portrait')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${orientation === 'portrait'
                                        ? 'bg-neutral-900 text-white shadow-sm'
                                        : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                                        }`}
                                >
                                    <PhonePortraitOutline
                                        color={orientation === 'portrait' ? '#fff' : '#404040'}
                                        width="18px"
                                        height="18px"
                                    />
                                    <span>Portrait</span>
                                </button>
                            </div>
                        </div>

                        {/* Jumlah */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Jumlah {type === 'image' ? 'Gambar' : 'Video'}
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="1"
                                    max={maxCount}
                                    value={count}
                                    onChange={(e) => setCount(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                />
                                <span className="text-xs text-neutral-500 whitespace-nowrap">
                                    Max {maxCount}
                                </span>
                            </div>
                            <p className="mt-1.5 text-xs text-neutral-600">
                                Estimasi: <span className="font-medium">{estimatedCredits} kredit</span>
                            </p>
                        </div>

                        {/* Info */}
                        <div className={`flex gap-3 p-3 rounded-lg border ${isAIImage || isAIVideo
                            ? 'bg-purple-50 border-purple-100'
                            : 'bg-blue-50 border-blue-100'
                            }`}>
                            <InformationCircleOutline
                                color={isAIImage || isAIVideo ? '#9333ea' : '#3b82f6'}
                                width="18px"
                                height="18px"
                                cssClasses="shrink-0 mt-0.5"
                            />
                            <p className={`text-xs leading-relaxed ${isAIImage || isAIVideo ? 'text-purple-900' : 'text-blue-900'
                                }`}>
                                {isAIImage
                                    ? '✨ AI generation butuh ~1 menit per gambar. Hasil bakal auto masuk ke galeri.'
                                    : isAIVideo
                                        ? '🎬 AI video generation butuh ~3 menit. Max 1 video (20 kredit). Hasil auto masuk ke galeri.'
                                        : `${type === 'image' ? 'Gambar' : 'Video'} bakal langsung masuk ke galeri media nih`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Footer - Fixed at bottom */}
                    <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex gap-3 rounded-b-xl shrink-0">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={(selectedKeywords.length === 0 && !inputValue.trim()) || isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                                    <span>Lagi proses...</span>
                                </>
                            ) : (
                                <span>Cari {type === 'image' ? 'Gambar' : 'Video'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )
        : null
}
