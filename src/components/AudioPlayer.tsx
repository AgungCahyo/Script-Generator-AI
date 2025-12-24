'use client'

import { useState, useRef, useEffect } from 'react'
import {
    PlayOutline,
    PauseOutline,
    VolumeHighOutline,
    VolumeMuteOutline,
    DownloadOutline,
    TrashOutline,
    Reload
} from 'react-ionicons'
import { useAudioContext } from '@/contexts/AudioContext'
import { AudioFile } from '@/lib/types/script'

interface AudioPlayerProps {
    src: string
    onDelete?: () => void
    selectedVoice?: string
    existingAudio?: AudioFile
}

export default function AudioPlayer({ src, onDelete, existingAudio }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const playerIdRef = useRef<string>(`audio-${Math.random().toString(36).substr(2, 9)}`)
    const audioContext = useAudioContext()
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const animationRef = useRef<number | null>(null)
    const lastUpdateRef = useRef<number>(0)
    const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio?.audioUrl || null)


    // Smooth slider animation using requestAnimationFrame with throttling
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateProgress = (timestamp: number) => {
            // Throttle updates to ~30fps for smoother visual
            if (timestamp - lastUpdateRef.current >= 4) {
                setCurrentTime(audio.currentTime)
                lastUpdateRef.current = timestamp
            }
            if (isPlaying && !audio.paused) {
                animationRef.current = requestAnimationFrame(updateProgress)
            }
        }

        if (isPlaying) {
            animationRef.current = requestAnimationFrame(updateProgress)
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [isPlaying])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateDuration = () => {
            setDuration(audio.duration)
            setIsLoading(false)
        }
        const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(audio.duration) // Ensure slider reaches the end
        }
        const handleCanPlay = () => setIsLoading(false)
        const handleError = () => {
            setError('Failed to load audio')
            setIsLoading(false)
        }

        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('error', handleError)

        return () => {
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('canplay', handleCanPlay)
            audio.removeEventListener('error', handleError)
        }
    }, [])

    // Register/unregister audio player with context
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const playerId = playerIdRef.current
        audioContext.registerPlayer(playerId, audio)

        // Handle external pause (when another player starts)
        const handlePause = () => {
            if (!audio.paused) {
                setIsPlaying(false)
            }
        }

        audio.addEventListener('pause', handlePause)

        return () => {
            audioContext.unregisterPlayer(playerId)
            audio.removeEventListener('pause', handlePause)
        }
    }, [audioContext])

    const togglePlay = async () => {
        const audio = audioRef.current
        if (!audio || isLoading) return

        try {
            if (isPlaying) {
                audio.pause()
                setIsPlaying(false)
            } else {
                // Pause all other audio players before playing this one
                audioContext.pauseOthers(playerIdRef.current)
                await audio.play()
                setIsPlaying(true)
            }
        } catch (err) {
            setError('Failed to play audio. Please try downloading instead.')
            setIsPlaying(false)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current
        if (!audio) return

        const time = parseFloat(e.target.value)
        audio.currentTime = time
        setCurrentTime(time)
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current
        if (!audio) return

        const vol = parseFloat(e.target.value)
        audio.volume = vol
        setVolume(vol)
        setIsMuted(vol === 0)
    }

    const toggleMute = () => {
        const audio = audioRef.current
        if (!audio) return

        if (isMuted) {
            audio.volume = volume || 0.5
            setIsMuted(false)
        } else {
            audio.volume = 0
            setIsMuted(true)
        }
    }

    const handleSpeedChange = (speed: number) => {
        const audio = audioRef.current
        if (!audio) return

        audio.playbackRate = speed
        setPlaybackRate(speed)
    }

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Normalize Google Drive URL to use proxy
    const getAudioSrc = () => {
        if (!src) return ''

        // If it's already a data URL, return as-is (no proxy needed)
        if (src.startsWith('data:')) return src

        // For Google Drive URLs, use proxy to bypass CORS
        if (src.includes('drive.google.com')) {
            return `/api/audio/proxy?url=${encodeURIComponent(src)}`
        }

        return src
    }

    const handleDelete = async () => {
        if (!onDelete || isDeleting) return
        setIsDeleting(true)
        try {
            await onDelete()
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDownload = async () => {
        if (isDownloading) return
        setIsDownloading(true)
        try {
            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 300))
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="bg-neutral-50 rounded-lg p-2.5 sm:p-4 border border-neutral-200">
            <audio
                ref={audioRef}
                src={getAudioSrc()}
                preload="metadata"
                crossOrigin="anonymous"
            />


            {/* Error Message */}
            {error && (
                <div className="mb-2 p-2 bg-black border border-red-200 rounded text-xs text-red-600">
                    {error}
                </div>
            )}

            {/* Main Controls */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    disabled={isLoading || !!error}
                    className="shrink-0 w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                    {isPlaying ? (
                        <PauseOutline color="#ffffff" width="20px" height="20px" />
                    ) : (
                        <PlayOutline color="#ffffff" width="20px" height="20px" />
                    )}
                </button>

                {/* Progress Bar */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2">
                    <span className="hidden xs:inline text-[10px] sm:text-xs text-neutral-500 font-mono tabular-nums">
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="any"
                        value={currentTime}
                        onChange={handleSeek}
                        disabled={isLoading || !!error}
                        className="flex-1 min-w-0 h-1.5 sm:h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-75
                            [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 sm:[&::-moz-range-thumb]:w-4 sm:[&::-moz-range-thumb]:h-4 
                            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:border-0"
                    />
                    <span className="text-[10px] sm:text-xs text-neutral-500 font-mono tabular-nums whitespace-nowrap">
                        {isLoading ? '--:--' : formatTime(duration)}
                    </span>
                </div>

                {/* Volume Control - Desktop only */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <button onClick={toggleMute} className="p-1.5 rounded hover:bg-neutral-200 transition-colors">
                        {isMuted || volume === 0 ? (
                            <VolumeMuteOutline color="#a3a3a3" width="18px" height="18px" />
                        ) : (
                            <VolumeHighOutline color="#a3a3a3" width="18px" height="18px" />
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900
                            [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:border-0"
                    />
                </div>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                {/* Speed Control */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                    {[0.5, 1, 1.5, 2].map((speed) => (
                        <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-medium rounded transition-colors active:scale-95 touch-manipulation ${playbackRate === speed
                                ? 'bg-neutral-900 text-white'
                                : 'text-neutral-500 hover:bg-neutral-200 active:bg-neutral-300'
                                }`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
                <div className='flex items-center gap-1.5 sm:gap-2'>
                    {/* Voice ID Badge */}
                    {existingAudio?.voiceId && (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                                {existingAudio.voiceId}
                            </span>
                        </div>
                    )}


                    {/* Download Button */}
                    <a
                        href={src}
                        download
                        onClick={handleDownload}
                        className={`shrink-0 flex items-center justify-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-medium rounded transition-all touch-manipulation ${isDownloading
                            ? 'text-neutral-400 cursor-not-allowed'
                            : 'text-neutral-600 hover:bg-neutral-200 active:bg-neutral-300 active:scale-95'
                            }`}
                    >
                        {isDownloading ? (
                            <Reload color="currentColor" width="14px" height="14px" cssClasses="animate-spin" />
                        ) : (
                            <DownloadOutline color="currentColor" width="14px" height="14px" />
                        )}
                        <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
                    </a>

                    {/* Delete Button */}
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`shrink-0 flex items-center justify-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-medium rounded transition-all touch-manipulation ${isDeleting
                                ? 'text-neutral-400 cursor-not-allowed'
                                : 'text-neutral-600 hover:bg-neutral-200 active:bg-neutral-300 active:scale-95'
                                }`}
                            title="Hapus Audio"
                        >
                            {isDeleting ? (
                                <Reload color="currentColor" width="14px" height="14px" cssClasses="animate-spin" />
                            ) : (
                                <TrashOutline color="currentColor" width="14px" height="14px" />
                            )}
                            <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Hapus'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
