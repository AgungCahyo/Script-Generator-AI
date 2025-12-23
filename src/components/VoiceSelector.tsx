'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownOutline, VolumeHighOutline } from 'react-ionicons'
import { VoiceOption } from '@/lib/constants/voice-options'

interface VoiceSelectorProps {
    value: string
    onChange: (value: string) => void
    options: VoiceOption[]
    disabled?: boolean
    onPreview?: (voiceId: string) => void
}

export default function VoiceSelector({
    value,
    onChange,
    options,
    disabled = false,
    onPreview
}: VoiceSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [playingVoice, setPlayingVoice] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleSelect = (optionValue: string) => {
        onChange(optionValue)
        setIsOpen(false)
    }

    const handlePreview = (e: React.MouseEvent, voiceId: string) => {
        e.stopPropagation() // Prevent dropdown from closing

        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }

        setPlayingVoice(voiceId)

        // Use static voice sample files instead of API
        const audioPath = `/voice-samples/${voiceId}.mp3`
        const audio = new Audio(audioPath)
        audioRef.current = audio

        audio.play().catch((error) => {
            console.error('Audio playback failed:', error)
            setPlayingVoice(null)
        })

        // Stop playing indicator when audio ends
        audio.onended = () => {
            setPlayingVoice(null)
        }

        // Fallback: stop indicator after 5 seconds if audio doesn't end
        setTimeout(() => {
            setPlayingVoice(null)
        }, 5000)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full h-10 px-3 text-sm bg-white border border-neutral-200 rounded-lg text-left flex items-center justify-between transition-all ${disabled
                    ? 'bg-neutral-50 cursor-not-allowed opacity-60'
                    : 'hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                    } ${isOpen ? 'ring-2 ring-neutral-900 border-transparent' : ''}`}
            >
                <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
                    {selectedOption?.label || 'Select voice...'}
                </span>
                <ChevronDownOutline
                    color="currentColor"
                    width="16px"
                    height="16px"
                    cssClasses={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${option.value === value
                                ? 'bg-neutral-100'
                                : 'hover:bg-neutral-50'
                                }`}
                        >
                            {/* Voice info - clickable to select */}
                            <button
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className="flex-1 text-left"
                            >
                                <div className="flex flex-col">
                                    <span className={`text-sm ${option.value === value ? 'font-medium text-neutral-900' : 'text-neutral-700'
                                        }`}>
                                        {option.label}
                                    </span>
                                    {option.description && (
                                        <span className="text-xs text-neutral-500 mt-0.5">
                                            {option.description}
                                        </span>
                                    )}
                                </div>
                            </button>

                            {/* Preview button */}
                            <button
                                type="button"
                                onClick={(e) => handlePreview(e, option.value)}
                                className={`p-1.5 rounded transition-colors shrink-0 ${playingVoice === option.value
                                    ? 'bg-neutral-900 text-white'
                                    : 'hover:bg-neutral-200 text-neutral-600'
                                    }`}
                                title="Preview voice"
                            >
                                <VolumeHighOutline
                                    color="currentColor"
                                    width="16px"
                                    height="16px"
                                    cssClasses={playingVoice === option.value ? 'animate-pulse' : ''}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
