export interface PexelsImage {
    id: number
    url: string
    downloadUrl: string
    photographer: string
    alt: string
    driveFileId: string
}

export interface PexelsCallbackPayload {
    scriptId: string
    images: PexelsImage[]
    count: number
    status: 'completed' | 'failed'
    error?: string
}

export interface PexelsTriggerRequest {
    scriptId: string
    keywords: string
    count: number
    orientation?: 'landscape' | 'portrait'
}
