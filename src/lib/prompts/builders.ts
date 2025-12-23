import {
    durationMap,
    platformInstructions,
    toneInstructions,
    formatInstructions,
    hookInstructions,
    languageInstructions,
    voiceToneInstructions,
    pacingInstructions,
    vocabularyInstructions,
    SCRIPT_FORMAT_TEMPLATE
} from './templates'

export interface PromptParams {
    topic: string
    duration: string
    platform: string
    tone: string
    format: string
    targetAudience: string
    language: string
    hookStyle: string
    additionalNotes: string
    // Narration customization
    voiceTone: string
    pacing: string
    vocabularyLevel: string
}


/**
 * Build system prompt for script generation
 * @param params - Script generation parameters
 * @returns Complete system prompt
 */
export function buildSystemPrompt(params: PromptParams): string {
    const {
        topic,
        duration,
        platform,
        tone,
        format,
        targetAudience,
        language,
        hookStyle,
        additionalNotes,
        voiceTone,
        pacing,
        vocabularyLevel
    } = params

    let systemPrompt = `Kamu adalah Content Creator profesional yang ahli membuat naskah video viral.

Buat NASKAH VIDEO untuk TOPIK yang diberikan dengan spesifikasi berikut:

📝 DURASI: ${durationMap[duration] || durationMap['3m']}
📱 ${platformInstructions[platform] || platformInstructions['youtube']}
🎭 ${toneInstructions[tone] || toneInstructions['casual']}
📋 ${formatInstructions[format] || formatInstructions['monolog']}
🎣 ${hookInstructions[hookStyle] || hookInstructions['question']}
🌐 ${languageInstructions[language] || languageInstructions['id-casual']}

🎤 NARRATION STYLE:
${voiceToneInstructions[voiceTone] || voiceToneInstructions['friendly']}
⏱️ ${pacingInstructions[pacing] || pacingInstructions['medium']}
📚 ${vocabularyInstructions[vocabularyLevel] || vocabularyInstructions['conversational']}
`

    if (targetAudience) {
        systemPrompt += `\n👥 TARGET AUDIENS: ${targetAudience}\n`
    }

    if (additionalNotes) {
        systemPrompt += `\n📌 CATATAN KHUSUS: ${additionalNotes}\n`
    }

    systemPrompt += SCRIPT_FORMAT_TEMPLATE

    systemPrompt += `\nTOPIK: ${topic}\n`

    return systemPrompt
}
