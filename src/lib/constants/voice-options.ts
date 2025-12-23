/**
 * Voice options for OpenAI TTS
 */

export interface VoiceOption {
    value: string
    label: string
    description?: string
}

// OpenAI TTS voice options
// https://platform.openai.com/docs/guides/text-to-speech
export const OPENAI_TTS_VOICES: VoiceOption[] = [
    {
        value: 'alloy',
        label: 'Alloy',
        description: 'Neutral, balanced voice'
    },
    {
        value: 'echo',
        label: 'Echo',
        description: 'Clear, articulate voice'
    },
    {
        value: 'fable',
        label: 'Fable',
        description: 'Warm, expressive voice'
    },
    {
        value: 'onyx',
        label: 'Onyx',
        description: 'Deep, authoritative voice'
    },
    {
        value: 'nova',
        label: 'Nova',
        description: 'Bright, energetic voice'
    },
    {
        value: 'shimmer',
        label: 'Shimmer',
        description: 'Soft, soothing voice'
    }
]

export const DEFAULT_VOICE = 'alloy'
