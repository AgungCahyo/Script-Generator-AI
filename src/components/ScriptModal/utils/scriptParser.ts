/**
 * Script section data structure
 */
export interface ScriptSection {
    timestamp: string        // e.g., "[00:00]"
    visual: string          // Visual description
    narasi: string          // Narration text
    index: number           // Section index for ordering
}

/**
 * Parse script text into sections based on timestamp, VISUAL, and NARASI format
 * 
 * Expected format:
 * [00:00]
 * VISUAL: ...
 * NARASI: ...
 * 
 * @param scriptText - The full script text to parse
 * @returns Array of ScriptSection objects
 */
export function parseScriptSections(scriptText: string): ScriptSection[] {
    if (!scriptText || typeof scriptText !== 'string') {
        return []
    }

    const sections: ScriptSection[] = []
    const lines = scriptText.split('\n')

    let currentTimestamp: string | null = null
    let currentVisual = ''
    let currentNarasi = ''
    let inVisual = false
    let inNarasi = false
    let sectionIndex = 0

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Check for timestamp pattern: [00:00] or [00:00:00]
        const timestampMatch = line.match(/^\[(\d{1,2}:\d{2}(:\d{2})?)\]$/)
        if (timestampMatch) {
            // Save previous section if exists
            if (currentTimestamp && (currentVisual || currentNarasi)) {
                sections.push({
                    timestamp: currentTimestamp,
                    visual: currentVisual.trim(),
                    narasi: currentNarasi.trim(),
                    index: sectionIndex++
                })
            }

            // Start new section
            currentTimestamp = line
            currentVisual = ''
            currentNarasi = ''
            inVisual = false
            inNarasi = false
            continue
        }

        // Check for VISUAL: label
        if (line.match(/^VISUAL:/i)) {
            inVisual = true
            inNarasi = false
            const afterColon = line.replace(/^VISUAL:\s*/i, '')
            currentVisual = afterColon
            continue
        }

        // Check for NARASI: label
        if (line.match(/^NARASI:/i)) {
            inNarasi = true
            inVisual = false
            const afterColon = line.replace(/^NARASI:\s*/i, '')
            currentNarasi = afterColon
            continue
        }

        // Empty line ends the current field
        if (line === '') {
            inVisual = false
            inNarasi = false
            continue
        }

        // Append to current field if we're in one
        if (inVisual && line) {
            currentVisual += ' ' + line
        } else if (inNarasi && line) {
            currentNarasi += ' ' + line
        }
    }

    // Don't forget the last section
    if (currentTimestamp && (currentVisual || currentNarasi)) {
        sections.push({
            timestamp: currentTimestamp,
            visual: currentVisual.trim(),
            narasi: currentNarasi.trim(),
            index: sectionIndex
        })
    }

    return sections
}

/**
 * Check if script text has the section format
 * @param scriptText - The script text to check
 * @returns true if script contains timestamp sections
 */
export function hasScriptSections(scriptText: string): boolean {
    if (!scriptText) return false
    return /\[\d{1,2}:\d{2}(:\d{2})?\]/.test(scriptText)
}
