export interface DropdownOption {
    value: string
    label: string
    description?: string
}

export const MODEL_OPTIONS: DropdownOption[] = [
    // Gemini 3 Series - Latest Generation (Preview)
    {
        value: 'gemini-3-pro-preview',
        label: 'Gemini 3 Pro (Preview)',
        description: 'Model terkuat untuk reasoning & agentic workflows'
    },
    {
        value: 'gemini-3-flash-preview',
        label: 'Gemini 3 Flash (Preview)',
        description: 'Tercepat & terintelijen dengan superior search'
    },

    // Gemini 2.5 Series - Stable & Production Ready
    {
        value: 'gemini-2.5-pro',
        label: 'Gemini 2.5 Pro',
        description: 'State-of-the-art thinking model untuk masalah kompleks'
    },
    {
        value: 'gemini-2.5-flash',
        label: 'Gemini 2.5 Flash',
        description: 'Best price-performance, ideal untuk large scale'
    },
    {
        value: 'gemini-2.5-flash-lite',
        label: 'Gemini 2.5 Flash-Lite',
        description: 'Tercepat, optimal untuk cost-efficiency & high throughput'
    },

    // Gemini 1.5 Series - Legacy but Stable
    {
        value: 'gemini-1.5-pro',
        label: 'Gemini 1.5 Pro',
        description: 'Stable model untuk berbagai task'
    },
    {
        value: 'gemini-1.5-flash',
        label: 'Gemini 1.5 Flash',
        description: 'Stable & cepat untuk task umum'
    },
]

export const DEFAULT_MODEL = 'gemini-3-flash-preview'
