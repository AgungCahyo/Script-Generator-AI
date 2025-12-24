interface RateLimitConfig {
    requests: number
    window: number // seconds
}

interface RateLimitEntry {
    count: number
    resetAt: number
}

interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

class InMemoryRateLimiter {
    private store: Map<string, RateLimitEntry>
    private cleanupInterval: NodeJS.Timeout | null = null

    constructor() {
        this.store = new Map()

        // Cleanup expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup()
        }, 5 * 60 * 1000)
    }

    private cleanup() {
        const now = Date.now()
        for (const [key, entry] of this.store.entries()) {
            if (entry.resetAt < now) {
                this.store.delete(key)
            }
        }
    }

    async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
        const now = Date.now()
        const windowMs = config.window * 1000

        let entry = this.store.get(key)

        // Reset if window expired or first request
        if (!entry || entry.resetAt < now) {
            entry = {
                count: 1,
                resetAt: now + windowMs
            }
            this.store.set(key, entry)

            return {
                success: true,
                limit: config.requests,
                remaining: config.requests - 1,
                reset: Math.floor(entry.resetAt / 1000)
            }
        }

        // Increment count
        entry.count++
        this.store.set(key, entry)

        const success = entry.count <= config.requests
        const remaining = Math.max(0, config.requests - entry.count)

        return {
            success,
            limit: config.requests,
            remaining,
            reset: Math.floor(entry.resetAt / 1000)
        }
    }

    // Manual cleanup for testing
    clear() {
        this.store.clear()
    }

    // Destroy cleanup interval
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
        }
    }
}

// Singleton instance
const rateLimiter = new InMemoryRateLimiter()

export { rateLimiter, type RateLimitConfig, type RateLimitResult }
