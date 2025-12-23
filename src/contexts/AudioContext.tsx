'use client'

import { createContext, useContext, useRef, ReactNode } from 'react'

interface AudioContextType {
    registerPlayer: (id: string, audioElement: HTMLAudioElement) => void
    unregisterPlayer: (id: string) => void
    pauseOthers: (currentId: string) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
    const playersRef = useRef<Map<string, HTMLAudioElement>>(new Map())

    const registerPlayer = (id: string, audioElement: HTMLAudioElement) => {
        playersRef.current.set(id, audioElement)
    }

    const unregisterPlayer = (id: string) => {
        playersRef.current.delete(id)
    }

    const pauseOthers = (currentId: string) => {
        playersRef.current.forEach((audio, id) => {
            if (id !== currentId && !audio.paused) {
                audio.pause()
            }
        })
    }

    return (
        <AudioContext.Provider value={{ registerPlayer, unregisterPlayer, pauseOthers }}>
            {children}
        </AudioContext.Provider>
    )
}

export function useAudioContext() {
    const context = useContext(AudioContext)
    if (!context) {
        throw new Error('useAudioContext must be used within AudioProvider')
    }
    return context
}
