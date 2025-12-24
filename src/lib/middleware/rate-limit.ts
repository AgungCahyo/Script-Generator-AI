import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter, RateLimitConfig, RateLimitResult } from '@/lib/utils/rate-limit'
import { getUserFromRequest } from '@/lib/api/auth'

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
    // Check various headers for real client IP
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
        return realIP
    }

    return 'unknown'
}

/**
 * Rate limit middleware
 * @param config Rate limit configuration
 * @param identifier 'user' (requires auth) or 'ip' (anonymous)
 */
export async function checkRateLimit(
    request: NextRequest,
    config: RateLimitConfig,
    identifier: 'user' | 'ip' = 'user'
): Promise<NextResponse | null> {
    try {
        let key: string

        if (identifier === 'user') {
            // User-based rate limiting (requires authentication)
            const user = await getUserFromRequest(request)
            if (!user) {
                // Fallback to IP for unauthenticated requests
                key = `ip:${getClientIP(request)}`
            } else {
                key = `user:${user.uid}`
            }
        } else {
            // IP-based rate limiting
            key = `ip:${getClientIP(request)}`
        }

        // Check rate limit
        const result: RateLimitResult = await rateLimiter.check(key, config)

        // Add rate limit headers to response
        const headers = {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
        }

        if (!result.success) {
            // Rate limit exceeded
            return NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retryAfter: result.reset - Math.floor(Date.now() / 1000)
                },
                {
                    status: 429,
                    headers: {
                        ...headers,
                        'Retry-After': (result.reset - Math.floor(Date.now() / 1000)).toString(),
                    }
                }
            )
        }

        // Rate limit OK, return null to continue
        return null
    } catch (error) {
        // On error, allow request to proceed (fail-open)
        console.error('Rate limit check failed:', error)
        return null
    }
}
