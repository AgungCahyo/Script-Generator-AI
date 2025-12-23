import { PexelsImage } from './pexels'

export interface AudioFile {
    blockIndex: number
    timestamp: string
    text: string
    audioUrl: string
    fileName: string
    duration?: number | null
}

export interface Script {
    id: string
    topic: string
    script: string | null
    audioUrl: string | null  // Legacy: single audio file
    audioFiles: AudioFile[] | null  // New: array of audio files per NARASI
    imageUrls: PexelsImage[] | null
    status: string
    error: string | null
    firstViewedAt: string | null
    userId: string
    createdAt: string
    updatedAt: string
}

export type ScriptStatus = 'pending' | 'processing' | 'completed' | 'failed'
