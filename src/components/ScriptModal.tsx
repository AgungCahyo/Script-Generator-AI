'use client'

import { useEffect, useState } from 'react'
import AudioPlayer from './AudioPlayer'
import MediaGallery from './MediaGallery'
import MediaToolbar from './MediaToolbar'
import { useToast } from './Toast'
import { useConfirm } from './Confirm'
import { PexelsImage } from '@/lib/types/pexels'
import {
    DocumentTextOutline,
    CloseOutline,
    CopyOutline,
    CheckmarkOutline,
    VolumeHighOutline,
    Reload,
    CreateOutline,
    MicOutline
} from 'react-ionicons'

// Import modular utilities and hooks
import { useScriptTyping, useScriptModal, useScriptActions } from './ScriptModal/hooks'
import { ReviewWarning, ScriptSectionCard } from './ScriptModal/components'
import { formatDate, parseScriptSections, hasScriptSections, type Script, type ScriptModalProps, type ScriptSection } from './ScriptModal/utils'
import { extractKeywords } from '@/lib/utils/keywords'
import { OPENAI_TTS_VOICES, DEFAULT_VOICE } from '@/lib/constants/voice-options'
import VoiceSelector from './VoiceSelector'

export default function ScriptModal({
    script,
    isOpen,
    onClose,
    onScriptUpdated,
    onRetry,
    authToken
}: ScriptModalProps) {
    const { showSuccess, showError, showWarning } = useToast()
    const { confirm } = useConfirm()

    // Voice selector state
    const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE)

    // Use custom hooks for modular state management
    const { displayedScript, skipTyping, isTyping, scriptContentRef } = useScriptTyping(script, authToken, onScriptUpdated)
    const { isMounted, copied, copyToClipboard, isEditingTitle, editedTitle, handleEditTitle, handleCancelEditTitle, setEditedTitle } = useScriptModal(isOpen)
    const { savingTitle, handleSaveTitle: saveTitle, saving, handleSave: saveScript, fetchingImages, handleFetchImages: fetchImages, generatingVideo, handleGenerateVideo: generateVideo, handleDeleteMedia: deleteMedia } = useScriptActions(script, authToken)
    const [isClosing, setIsClosing] = useState(false)

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose()
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        } else {
            setIsClosing(false)
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    const handleClose = () => {
        setIsClosing(true)
        setTimeout(() => {
            onClose()
        }, 300)
    }

    if (!isOpen || !script) return null

    // Wrapped action handlers with toast notifications

    const handleFetchImagesClick = async (keywords: string, count: number, orientation: string, source?: string) => {
        if (!authToken) {
            showWarning('Login dulu dong buat cari gambar')
            return
        }

        // Store initial image count
        const initialImageCount = (script.imageUrls as any[])?.length || 0
        const isAI = source === 'ai'

        // For AI images, make multiple API calls (1 per request)
        if (isAI) {
            for (let i = 0; i < count; i++) {
                await fetchImages(
                    keywords,
                    1,  // Always 1 for AI
                    orientation,
                    source,
                    async (images) => {
                        // Success - AI request initiated
                    },
                    (error) => showError(error)
                )
                // Small delay between requests
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                }
            }

            // Start polling after ALL requests sent
            let pollAttempts = 0
            const maxAttempts = 60 // 2 minutes for AI

            const pollForImages = setInterval(async () => {
                try {
                    const res = await fetch(`/api/scripts/${script.id}`, {
                        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
                    })
                    const data = await res.json()

                    if (data.script) {
                        const newImageCount = (data.script.imageUrls as any[])?.length || 0

                        // Check if new images appeared
                        if (newImageCount > initialImageCount) {
                            clearInterval(pollForImages)
                            onScriptUpdated(data.script)
                            showSuccess(`${newImageCount - initialImageCount} gambar AI berhasil di-generate!`)
                            return
                        }
                    }

                    pollAttempts++
                    if (pollAttempts >= maxAttempts) {
                        clearInterval(pollForImages)
                        showWarning('AI generation timeout. Refresh untuk lihat hasil.')
                    }
                } catch (error) {
                }
            }, 2000) // Poll every 2 seconds

        } else {
            // Stock images: single call with polling
            await fetchImages(
                keywords,
                count,
                orientation,
                source,
                async (images) => {
                    // Start polling for updated images (callback updates DB async)
                    let pollAttempts = 0
                    const maxAttempts = 15 // 30 seconds for stock

                    const pollForImages = setInterval(async () => {
                        try {
                            const res = await fetch(`/api/scripts/${script.id}`, {
                                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
                            })
                            const data = await res.json()

                            if (data.script) {
                                const newImageCount = (data.script.imageUrls as any[])?.length || 0

                                // Check if new images appeared
                                if (newImageCount > initialImageCount) {
                                    clearInterval(pollForImages)
                                    onScriptUpdated(data.script)
                                    showSuccess(`Fetched ${newImageCount - initialImageCount} images successfully`)
                                    return
                                }
                            }

                            pollAttempts++
                            if (pollAttempts >= maxAttempts) {
                                clearInterval(pollForImages)
                                showWarning('Images fetch timed out. Please refresh to see results.')
                            }
                        } catch (error) {
                        }
                    }, 2000) // Poll every 2 seconds
                },
                (error) => showError(error)
            )
        }
    }

    const handleGenerateVideoClick = async (keywords: string, count: number, orientation: string, source?: string) => {
        if (!authToken) {
            showWarning('Login dulu buat cari video')
            return
        }

        // Store initial media count
        const initialMediaCount = (script.imageUrls as any[])?.length || 0

        await generateVideo(
            keywords,
            count,
            orientation,
            source,
            async (videos) => {
                // Start polling for updated videos (callback updates DB async)
                let pollAttempts = 0
                const maxAttempts = 15 // Poll for max 30 seconds

                const pollForVideos = setInterval(async () => {
                    try {
                        const res = await fetch(`/api/scripts/${script.id}`, {
                            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
                        })
                        const data = await res.json()

                        if (data.script) {
                            const newMediaCount = (data.script.imageUrls as any[])?.length || 0

                            // Check if new videos appeared
                            if (newMediaCount > initialMediaCount) {
                                clearInterval(pollForVideos)
                                onScriptUpdated(data.script)
                                showSuccess(`Fetched ${newMediaCount - initialMediaCount} videos successfully`)
                                return
                            }
                        }

                        pollAttempts++
                        if (pollAttempts >= maxAttempts) {
                            clearInterval(pollForVideos)
                            showWarning('Video search timed out. Please refresh to see results.')
                        }
                    } catch (error) {
                    }
                }, 2000) // Poll every 2 seconds
            },
            (error) => showError(error)
        )
    }

    const handleDeleteMediaClick = async (mediaId: string) => {
        await deleteMedia(
            mediaId,
            async () => {
                // Refetch script from database to get updated imageUrls
                try {
                    const res = await fetch(`/api/scripts/${script.id}`, {
                        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
                    })
                    const data = await res.json()
                    if (data.script) {
                        onScriptUpdated(data.script)
                    }
                } catch (error) {
                }
                showSuccess('Media deleted successfully')
            },
            (error) => showError(error)
        )
    }

    const handleCopyClick = () => copyToClipboard(script.script || '')

    const handleSaveTitleClick = async () => {
        if (!authToken) {
            showWarning('Login dulu ya buat edit judul')
            return
        }
        if (!editedTitle.trim()) {
            showWarning('Title cannot be empty')
            return
        }
        await saveTitle(
            editedTitle.trim(),
            (updated) => {
                onScriptUpdated(updated)
                handleCancelEditTitle()
                showSuccess('Title saved successfully')
            },
            (error) => showError(error)
        )
    }

    // Handle section update
    const handleSectionUpdate = async (updatedSection: ScriptSection) => {
        if (!authToken || !script?.script) return

        // Parse all sections
        const sections = parseScriptSections(script.script)

        // Update the specific section
        const newSections = sections.map(s =>
            s.index === updatedSection.index ? updatedSection : s
        )

        // Rebuild the script text
        const newScriptText = newSections.map(s =>
            `${s.timestamp}\nVISUAL: ${s.visual}\nNARASI: ${s.narasi}`
        ).join('\n\n')

        // Save to database
        await saveScript(
            newScriptText,
            (updated) => {
                onScriptUpdated(updated)
                // Don't show success toast here, card component already shows it
            },
            (error) => showError(error)
        )
    }

    // Extract media for gallery
    const mediaItems = (script.imageUrls || []) as (PexelsImage & { type?: string; driveFileId?: string })[]
    const images = mediaItems.filter((item) => item.type !== 'video')
    const videos = mediaItems.filter((item) => item.type === 'video')

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen && isMounted ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : (isOpen && isMounted ? 'opacity-100' : 'opacity-0')}`}
                onClick={handleClose}
            />

            {/* Modal with popup animation */}
            <div className={`relative w-full h-full sm:max-w-5xl sm:max-h-[90vh] sm:m-4 bg-neutral-100 sm:rounded-lg shadow-xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${isClosing ? 'scale-95 opacity-0' : (isOpen && isMounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0')}`}>
                {/* Header Bar */}
                <div className="flex items-center justify-between px-2 sm:px-4 py-2 bg-white border-b border-neutral-200">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                        <DocumentTextOutline color="#525252" width="16px" height="16px" cssClasses="hidden sm:block shrink-0" />
                        {isEditingTitle ? (
                            <>
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTitleClick()
                                        if (e.key === 'Escape') handleCancelEditTitle()
                                    }}
                                    className="flex-1 min-w-0 text-xs sm:text-sm font-medium text-neutral-700 px-2 py-1 border border-neutral-300 rounded focus:outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveTitleClick}
                                    disabled={savingTitle}
                                    className="p-1 text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 shrink-0"
                                    title="Save"
                                >
                                    {savingTitle ? (
                                        <Reload color="currentColor" width="14px" height="14px" cssClasses="animate-spin" />
                                    ) : (
                                        <CheckmarkOutline color="currentColor" width="14px" height="14px" />
                                    )}
                                </button>
                                <button
                                    onClick={handleCancelEditTitle}
                                    className="p-1 text-neutral-600 hover:bg-neutral-100 rounded shrink-0"
                                    title="Cancel"
                                >
                                    <CloseOutline color="currentColor" width="14px" height="14px" />
                                </button>
                            </>
                        ) : (
                            <button
                                className="flex items-center gap-1 min-w-0 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-500 transition-colors group"
                                onClick={() => handleEditTitle(script.topic)}
                                title="Click to edit title"
                            >
                                <span className="truncate">{script.topic}</span>
                                <CreateOutline color="currentColor" width="12px" height="12px" cssClasses="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded hidden sm:inline shrink-0 ${script.status === 'completed' ? 'bg-green-100 text-green-700' :
                            script.status === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                            {script.status}
                        </span>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center gap-0.5 sm:gap-1">
                        {script.status === 'completed' && (
                            <>
                                <button
                                    onClick={handleCopyClick}
                                    className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                                    title="Copy"
                                >
                                    {copied ? (
                                        <>
                                            <CheckmarkOutline color="#16a34a" width="16px" height="16px" />
                                            <span className="hidden sm:inline">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <CopyOutline color="currentColor" width="16px" height="16px" />
                                            <span className="hidden sm:inline">Copy</span>
                                        </>
                                    )}
                                </button>
                                <MediaToolbar
                                    scriptId={script.id}
                                    topic={script.topic}
                                    hasScript={!!script.script}
                                    authToken={authToken}
                                    onFetchImages={handleFetchImagesClick}
                                    onGenerateVideo={handleGenerateVideoClick}
                                    fetchingImages={fetchingImages}
                                    generatingVideo={generatingVideo}
                                    extractedKeywords={script.keywords || extractKeywords(script.script)}
                                />
                            </>
                        )}


                        <div className="w-px h-4 bg-neutral-200 mx-2" />
                        <button
                            onClick={handleClose}
                            className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded transition-colors"
                        >
                            <CloseOutline color="currentColor" width="20px" height="20px" />
                        </button>
                    </div>
                </div>

                {/* Document area */}
                <div className="flex-1 overflow-auto p-4 sm:p-8">
                    <div className="max-w-3xl mx-auto bg-white rounded shadow-sm border border-neutral-200 min-h-full">
                        <div className="p-4 sm:p-8 lg:p-12">
                            {/* Header */}
                            <div className="mb-4 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-100">
                                <h1 className="text-lg sm:text-2xl font-serif text-neutral-800 mb-2">
                                    {script.topic}
                                </h1>

                                <div className="flex flex-col gap-1.5">
                                    <p className="text-[10px] sm:text-xs text-neutral-400">
                                        Created {formatDate(script.createdAt)}
                                        {script.updatedAt !== script.createdAt &&
                                            ` • Updated ${formatDate(script.updatedAt)}`
                                        }
                                    </p>


                                    {((script as any).keywords || extractKeywords(script.script || '')) && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {((script as any).keywords || extractKeywords(script.script || ''))
                                                .split(',')
                                                .slice(0, 8)  // Limit to first 8 keywords
                                                .map((keyword: string, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block px-2 py-0.5 text-[10px] bg-neutral-100 text-neutral-600 rounded-full whitespace-nowrap"
                                                    >
                                                        {keyword.trim()}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    )}

                                    {/* Voice Selector */}
                                    {hasScriptSections(script.script || '') && (
                                        <div className="mt-3 pt-3 border-t border-neutral-100">
                                            <div className="flex items-center gap-2">
                                                <MicOutline color="#737373" width="14px" height="14px" />
                                                <span className="text-xs text-neutral-500 font-medium">TTS Voice:</span>
                                                <div className="flex-1 max-w-xs">
                                                    <VoiceSelector
                                                        value={selectedVoice}
                                                        onChange={setSelectedVoice}
                                                        options={OPENAI_TTS_VOICES}
                                                        disabled={false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Review Warning Note */}
                            <ReviewWarning
                                show={script.status === 'completed' && !script.audioFiles && !script.audioUrl && displayedScript.length === (script.script?.length || 0)}
                            />

                            {/* Legacy Audio Player - only show for non-section scripts */}
                            {!hasScriptSections(script.script || '') && script.audioUrl && (
                                <div className="mb-6">
                                    <AudioPlayer
                                        src={script.audioUrl}
                                        onDelete={() => handleDeleteMediaClick('audio')}
                                    />
                                </div>
                            )}

                            {/* Media Gallery */}
                            <MediaGallery
                                images={images}
                                videos={videos}
                                onDeleteMedia={handleDeleteMediaClick}
                                fetchingImages={fetchingImages}
                            />

                            {/* Script Content */}
                            <div>
                                <div ref={scriptContentRef}>
                                    {script.status === 'processing' ? (


                                        <div className="text-sm leading-7 text-neutral-700 whitespace-pre-wrap overflow-y-auto max-h-[60vh]">
                                            {displayedScript ? (
                                                <div>
                                                    {displayedScript}
                                                    <span className="inline-block w-1.5 h-4 bg-neutral-900 ml-1 animate-pulse" />
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Reload color="#a3a3a3" width="32px" height="32px" cssClasses="animate-spin" />
                                                        <p className="text-neutral-400">Generating script...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : script.status === 'failed' ? (
                                        <div className="text-center py-8">
                                            <div className="flex flex-col items-center gap-3">
                                                <p className="text-red-500">{script.error || 'Generation failed'}</p>
                                                {onRetry && (
                                                    <button
                                                        onClick={() => onRetry(script.id)}
                                                        className="px-4 py-2 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
                                                    >
                                                        Retry
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : script.script ? (
                                        // Check if script has sections format
                                        hasScriptSections(script.script) ? (
                                            // Render as section cards
                                            <div className="space-y-4">
                                                {parseScriptSections(script.script).map((section) => (
                                                    <ScriptSectionCard
                                                        key={section.index}
                                                        section={section}
                                                        scriptId={script.id}
                                                        authToken={authToken}
                                                        selectedVoice={selectedVoice}
                                                        existingAudio={script.audioFiles?.find(
                                                            (af) => af.timestamp === section.timestamp
                                                        )}
                                                        onSectionUpdated={handleSectionUpdate}
                                                        onScriptUpdated={onScriptUpdated}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            // Render as plain text (legacy format)
                                            <div className="text-sm leading-7 text-neutral-700 whitespace-pre-wrap overflow-y-auto max-h-[60vh]">
                                                <div>
                                                    {displayedScript}
                                                    {isTyping && <span className="inline-block w-1.5 h-4 bg-neutral-900 ml-1 animate-pulse" />}
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-neutral-400">No content available</p>
                                        </div>
                                    )}

                                    {/* Skip Typing Button - shown only while actively typing */}
                                    {isTyping && displayedScript && script?.script && displayedScript.length < script.script.length && (
                                        <div className="mt-4 flex justify-center">
                                            <button
                                                onClick={skipTyping}
                                                className="px-3 py-1.5 text-xs bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
                                            >
                                                <span>Skip Typing</span>
                                                <span className="text-[10px]">→</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
