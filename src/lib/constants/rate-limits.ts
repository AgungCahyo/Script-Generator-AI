// Rate limit configurations for different API endpoints
export const RATE_LIMITS = {
    SCRIPT_GENERATE: { requests: 5, window: 60 },      // 5 requests per minute
    IMAGE_SEARCH: { requests: 10, window: 60 },        // 10 requests per minute
    VIDEO_SEARCH: { requests: 10, window: 60 },        // 10 requests per minute
    TTS_GENERATE: { requests: 20, window: 60 },        // 20 requests per minute
    PAYMENT_CREATE: { requests: 3, window: 60 },       // 3 requests per minute
    VOICE_PREVIEW: { requests: 10, window: 60 },       // 10 requests per minute
} as const
