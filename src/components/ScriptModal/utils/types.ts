import { AudioFile } from '@/lib/types/script'
import { PexelsImage } from '@/lib/types/pexels'

/**
 * Script data structure
 */
export interface Script {
    id: string
    topic: string
    script: string | null
    audioUrl: string | null
    audioFiles: AudioFile[] | null
    imageUrls: PexelsImage[] | null
    status: string
    error: string | null
    firstViewedAt: string | null
    userId: string
    createdAt: string
    updatedAt: string
}

/**
 * Props for ScriptModal component
 */
export interface ScriptModalProps {
    script: Script | null
    isOpen: boolean
    onClose: () => void
    onScriptUpdated: (script: Script) => void
    onRetry?: (scriptId: string) => void
    authToken?: string
}
