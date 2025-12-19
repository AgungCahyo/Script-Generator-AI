export interface Script {
    id: string
    topic: string
    script: string | null
    audioUrl: string | null
    status: string
    error: string | null
    createdAt: string
    updatedAt: string
}

export type ScriptStatus = 'pending' | 'processing' | 'completed' | 'failed'
