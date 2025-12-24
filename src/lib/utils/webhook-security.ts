import crypto from 'crypto'

/**
 * Verify webhook signature from n8n
 * Uses static secret comparison since crypto module is disallowed in n8n
 */
export function verifyWebhookSignature(
    body: string,
    signature: string | null
): boolean {
    const secret = process.env.N8N_WEBHOOK_SECRET

    // In development, allow without signature
    if (process.env.NODE_ENV === 'development' && !secret) {
        console.warn('⚠️ Development mode: Webhook signature check bypassed')
        return true
    }

    if (!secret) {
        console.error('N8N_WEBHOOK_SECRET not configured')
        return false
    }

    if (!signature) {
        console.error('No webhook signature provided')
        return false
    }

    // Simple constant-time comparison to prevent timing attacks
    try {
        const expectedBuffer = Buffer.from(secret)
        const receivedBuffer = Buffer.from(signature)

        // Constant-time comparison
        return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    } catch (error) {
        // Buffers different length, definitely not equal
        console.error('Webhook signature verification failed:', error)
        return false
    }
}

/**
 * Conditional logger - only logs in development
 */
export const devLog = process.env.NODE_ENV === 'development'
    ? console.log.bind(console)
    : () => { }
