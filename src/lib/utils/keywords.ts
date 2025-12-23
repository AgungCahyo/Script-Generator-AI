/**
 * Utility functions for extracting keywords from script content
 */

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
