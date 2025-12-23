/**
 * Utility functions for ScriptModal component
 */

/**
 * Format date string to Indonesian locale
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Extract image keywords from script content
 */
export const extractKeywords = (scriptText: string | null): string => {
    if (!scriptText) return ''
    const keywordsMatch = scriptText.match(/IMAGE KEYWORDS:\s*\n?([^\n]+)/i)
    if (keywordsMatch) {
        return keywordsMatch[1].trim()
    }
    return ''
}
