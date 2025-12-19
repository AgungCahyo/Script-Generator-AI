import { ERROR_MESSAGES } from '@/lib/constants/error-messages'

/**
 * Custom application error class
 */
export class AppError extends Error {
    constructor(
        public userMessage: string,
        public statusCode: number = 500,
        public originalError?: unknown
    ) {
        super(userMessage)
        this.name = 'AppError'
    }
}

/**
 * Parse Gemini AI errors to user-friendly messages
 */
export function parseGeminiError(error: unknown): AppError {
    const errorString = error instanceof Error ? error.message : String(error)

    // API Key errors
    if (errorString.includes('API_KEY_INVALID') || errorString.includes('API Key not found')) {
        return new AppError(ERROR_MESSAGES.API_KEY_INVALID, 500, error)
    }

    // Rate limiting
    if (errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('429')) {
        return new AppError(ERROR_MESSAGES.AI_RATE_LIMIT, 429, error)
    }

    // Quota exceeded
    if (errorString.includes('quota') || errorString.includes('QUOTA_EXCEEDED')) {
        return new AppError(ERROR_MESSAGES.AI_QUOTA_EXCEEDED, 429, error)
    }

    // Timeout
    if (errorString.includes('timeout') || errorString.includes('DEADLINE_EXCEEDED')) {
        return new AppError(ERROR_MESSAGES.AI_TIMEOUT, 504, error)
    }

    // Invalid model
    if (errorString.includes('not found') || errorString.includes('MODEL_NOT_FOUND')) {
        return new AppError(ERROR_MESSAGES.INVALID_MODEL, 400, error)
    }

    // Generic AI error
    return new AppError(ERROR_MESSAGES.AI_GENERATION_FAILED, 500, error)
}

/**
 * Parse database errors to user-friendly messages
 */
export function parseDatabaseError(error: unknown): AppError {
    const errorString = error instanceof Error ? error.message : String(error)

    if (errorString.includes('Unique constraint')) {
        return new AppError('This item already exists', 409, error)
    }

    if (errorString.includes('Foreign key constraint')) {
        return new AppError('Cannot delete: item is in use', 400, error)
    }

    if (errorString.includes('not found')) {
        return new AppError(ERROR_MESSAGES.SCRIPT_NOT_FOUND, 404, error)
    }

    return new AppError(ERROR_MESSAGES.DATABASE_ERROR, 500, error)
}

/**
 * Parse any error to user-friendly message
 */
export function parseError(error: unknown): AppError {
    // Already an AppError
    if (error instanceof AppError) {
        return error
    }

    const errorString = error instanceof Error ? error.message : String(error)

    // Check for specific error patterns
    if (errorString.includes('generativelanguage.googleapis.com')) {
        return parseGeminiError(error)
    }

    if (errorString.includes('Prisma') || errorString.includes('database')) {
        return parseDatabaseError(error)
    }

    if (errorString.includes('fetch') || errorString.includes('network')) {
        return new AppError(ERROR_MESSAGES.NETWORK_ERROR, 503, error)
    }

    // Default error
    return new AppError(ERROR_MESSAGES.UNKNOWN_ERROR, 500, error)
}

/**
 * Create error response for API routes
 */
export function createErrorResponse(error: unknown) {
    const appError = parseError(error)

    // Log the original error for debugging
    console.error('Error:', {
        userMessage: appError.userMessage,
        statusCode: appError.statusCode,
        originalError: appError.originalError
    })

    return new Response(
        JSON.stringify({
            error: appError.userMessage,
            success: false
        }),
        {
            status: appError.statusCode,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}
