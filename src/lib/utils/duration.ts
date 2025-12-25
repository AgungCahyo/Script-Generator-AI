/**
 * Parse duration string to minutes
 * 
 * Examples:
 * - '30s' -> 0.5
 * - '1m' -> 1
 * - '3m' -> 3
 * - '5m' -> 5
 * - '10m' -> 10
 * - 3 -> 3 (numeric values passed through)
 * 
 * @param duration - Duration string (e.g., '30s', '1m') or number
 * @returns Duration in minutes
 */
export function parseDurationToMinutes(duration: string | number): number {
    // If already a number, return as-is
    if (typeof duration === 'number') {
        return duration
    }

    // Handle string format
    const trimmed = duration.trim().toLowerCase()

    // Match pattern: number followed by optional unit (s, m, min, sec)
    const match = trimmed.match(/^(\d+(?:\.\d+)?)(s|m|min|sec|seconds?|minutes?)?$/)

    if (!match) {
        console.warn(`Invalid duration format: "${duration}", defaulting to 3 minutes`)
        return 3 // Default fallback
    }

    const value = parseFloat(match[1])
    const unit = match[2] || 'm' // Default to minutes if no unit specified

    // Convert to minutes
    switch (unit) {
        case 's':
        case 'sec':
        case 'second':
        case 'seconds':
            return value / 60 // Convert seconds to minutes
        case 'm':
        case 'min':
        case 'minute':
        case 'minutes':
            return value
        default:
            console.warn(`Unknown duration unit: "${unit}", treating as minutes`)
            return value
    }
}

/**
 * Format duration in minutes to human-readable string
 * 
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "30 detik", "3 menit")
 */
export function formatDuration(minutes: number): string {
    if (minutes < 1) {
        const seconds = Math.round(minutes * 60)
        return `${seconds} detik`
    }
    return `${minutes} menit`
}
