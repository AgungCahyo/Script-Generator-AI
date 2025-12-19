/**
 * Error messages for user-friendly display
 */
export const ERROR_MESSAGES = {
    // Authentication errors
    UNAUTHORIZED: 'Please sign in to continue',
    INVALID_TOKEN: 'Your session has expired. Please sign in again',

    // API Key errors
    API_KEY_MISSING: 'Service temporarily unavailable. Please try again later',
    API_KEY_INVALID: 'Service configuration error. Please contact support',

    // Validation errors
    TOPIC_REQUIRED: 'Please enter a topic for your script',
    INVALID_MODEL: 'Selected AI model is not available',

    // AI Generation errors
    AI_GENERATION_FAILED: 'Failed to generate script. Please try again',
    AI_RATE_LIMIT: 'Too many requests. Please wait a moment and try again',
    AI_QUOTA_EXCEEDED: 'Daily usage limit reached. Please try again tomorrow',
    AI_TIMEOUT: 'Request took too long. Please try a shorter topic',

    // Database errors
    DATABASE_ERROR: 'Failed to save data. Please try again',
    SCRIPT_NOT_FOUND: 'Script not found',

    // Audio generation errors
    AUDIO_GENERATION_FAILED: 'Failed to generate audio. Please try again',
    AUDIO_SERVICE_UNAVAILABLE: 'Audio service is temporarily unavailable',

    // Webhook errors
    WEBHOOK_FAILED: 'Failed to process request. Please try again',

    // Generic errors
    INTERNAL_ERROR: 'Something went wrong. Please try again later',
    NETWORK_ERROR: 'Network error. Please check your connection',
    UNKNOWN_ERROR: 'An unexpected error occurred'
} as const

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES
