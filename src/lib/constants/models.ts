export interface DropdownOption {
    value: string
    label: string
    description?: string
    tier?: number
    credits?: number
    badge?: string
}

export const MODEL_OPTIONS: DropdownOption[] = [
    // Gemini 2.5 Flash-Lite - Tier 1 (Economy)
    {
        value: 'gemini-2.5-flash-lite',
        label: 'Gemini 2.5 Flash-Lite',
        description: 'Tercepat, optimal untuk cost-efficiency & high throughput',
        tier: 1,
        credits: 20,
        badge: 'HEMAT'
    },

    // Gemini Flash Series - Tier 2 (Standard - RECOMMENDED)
    {
        value: 'gemini-2.5-flash',
        label: 'Gemini 2.5 Flash',
        description: 'Best price-performance, ideal untuk large scale',
        tier: 2,
        credits: 30,
        badge: 'REKOMENDASI'
    },
    {
        value: 'gemini-3-flash-preview',
        label: 'Gemini 3 Flash (Preview)',
        description: 'Tercepat & terintelijen dengan superior search',
        tier: 2,
        credits: 30,
        badge: 'TERBARU'
    },
    {
        value: 'gemini-1.5-flash',
        label: 'Gemini 1.5 Flash',
        description: 'Stable & cepat untuk task umum',
        tier: 2,
        credits: 30,
        badge: 'STABLE'
    },

    // Gemini Pro Series - Tier 3 (Premium)
    {
        value: 'gemini-2.5-pro',
        label: 'Gemini 2.5 Pro',
        description: 'State-of-the-art thinking model untuk masalah kompleks',
        tier: 3,
        credits: 50,
        badge: 'PREMIUM'
    },
    {
        value: 'gemini-3-pro-preview',
        label: 'Gemini 3 Pro (Preview)',
        description: 'Model terkuat untuk reasoning & agentic workflows',
        tier: 3,
        credits: 50,
        badge: 'PRO'
    },
    {
        value: 'gemini-1.5-pro',
        label: 'Gemini 1.5 Pro',
        description: 'Stable model untuk berbagai task',
        tier: 3,
        credits: 50,
        badge: 'PRO'
    },
]

export const DEFAULT_MODEL = 'gemini-2.5-flash' // Tier 2 - best value

