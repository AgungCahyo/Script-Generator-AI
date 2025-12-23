export interface VeoVideo {
    id: string
    url: string
    downloadUrl: string
    embedUrl: string
    driveFileId: string
}

export interface VeoCallbackPayload {
    scriptId: string
    video: VeoVideo
    status: 'completed' | 'failed'
    error?: string
}

export interface VeoTriggerRequest {
    scriptId: string
    prompt: string
    duration?: number
    aspectRatio?: string
}
