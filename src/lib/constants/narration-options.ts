/**
 * Narration style options for enhanced script customization
 */

export interface NarrationOption {
    value: string
    label: string
    description?: string
}

// Voice Tone Options
export const VOICE_TONE_OPTIONS: NarrationOption[] = [
    {
        value: 'friendly',
        label: 'Friendly & Casual',
        description: 'Ramah dan santai seperti ngobrol sama teman'
    },
    {
        value: 'professional',
        label: 'Professional & Authoritative',
        description: 'Profesional dan berwibawa'
    },
    {
        value: 'dramatic',
        label: 'Dramatic & Mysterious',
        description: 'Dramatis dan misterius, cocok untuk storytelling'
    },
    {
        value: 'calm',
        label: 'Calm & Soothing',
        description: 'Tenang dan menenangkan, cocok untuk ASMR/relaksasi'
    },
    {
        value: 'energetic',
        label: 'Energetic & Dynamic',
        description: 'Energik dan dinamis, cocok untuk konten viral'
    },
    {
        value: 'educational',
        label: 'Educational & Clear',
        description: 'Edukatif dan jelas, seperti guru yang baik'
    }
]

export const DEFAULT_VOICE_TONE = 'friendly'

// Content Pacing Options
export const PACING_OPTIONS: NarrationOption[] = [
    {
        value: 'very-slow',
        label: 'Very Slow',
        description: 'Sangat lambat, untuk ASMR atau meditasi'
    },
    {
        value: 'slow',
        label: 'Slow',
        description: 'Lambat, untuk topik kompleks atau storytelling'
    },
    {
        value: 'medium',
        label: 'Medium',
        description: 'Sedang, standar untuk kebanyakan konten'
    },
    {
        value: 'fast',
        label: 'Fast',
        description: 'Cepat, untuk konten entertainment'
    },
    {
        value: 'very-fast',
        label: 'Very Fast',
        description: 'Sangat cepat, untuk viral shorts/reels'
    }
]

export const DEFAULT_PACING = 'medium'

// Vocabulary Level Options
export const VOCABULARY_OPTIONS: NarrationOption[] = [
    {
        value: 'simple',
        label: 'Simple',
        description: 'Kata-kata sederhana, mudah dipahami semua orang'
    },
    {
        value: 'conversational',
        label: 'Conversational',
        description: 'Bahasa percakapan sehari-hari'
    },
    {
        value: 'professional',
        label: 'Professional',
        description: 'Bahasa profesional dengan istilah bisnis'
    },
    {
        value: 'technical',
        label: 'Technical',
        description: 'Bahasa teknis untuk topik spesifik'
    }
]

export const DEFAULT_VOCABULARY = 'conversational'
