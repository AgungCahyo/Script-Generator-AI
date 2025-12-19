import { DropdownOption } from './models'

export const DURATION_OPTIONS: DropdownOption[] = [
    { value: '30s', label: '30 detik', description: '~80-100 kata' },
    { value: '1m', label: '1 menit', description: '~150-180 kata' },
    { value: '3m', label: '3 menit', description: '~450-500 kata' },
    { value: '5m', label: '5 menit', description: '~750-850 kata' },
    { value: '10m', label: '10 menit', description: '~1500 kata' },
]

export const PLATFORM_OPTIONS: DropdownOption[] = [
    { value: 'tiktok', label: 'TikTok', description: 'Hook 3 detik, cepat' },
    { value: 'youtube-shorts', label: 'YouTube Shorts', description: 'Hook 2 detik' },
    { value: 'youtube', label: 'YouTube', description: 'Lebih detail' },
    { value: 'podcast', label: 'Podcast', description: 'Conversational' },
    { value: 'instagram-reels', label: 'Instagram Reels', description: 'Visual-heavy' },
]

export const TONE_OPTIONS: DropdownOption[] = [
    { value: 'casual', label: 'Casual', description: 'Santai & friendly' },
    { value: 'professional', label: 'Profesional', description: 'Formal & engaging' },
    { value: 'humor', label: 'Lucu/Humor', description: 'Menghibur' },
    { value: 'inspirational', label: 'Inspiratif', description: 'Memotivasi' },
    { value: 'educational', label: 'Edukatif', description: 'Informatif' },
]

export const FORMAT_OPTIONS: DropdownOption[] = [
    { value: 'monolog', label: 'Monolog', description: 'Langsung ke kamera' },
    { value: 'storytelling', label: 'Storytelling', description: 'Dengan alur cerita' },
    { value: 'tutorial', label: 'Tutorial', description: 'Step-by-step' },
    { value: 'review', label: 'Review', description: 'Pros & cons' },
    { value: 'tips', label: 'Tips & Tricks', description: 'Actionable points' },
]

export const LANGUAGE_OPTIONS: DropdownOption[] = [
    { value: 'id-casual', label: 'Bahasa Indonesia (Santai)' },
    { value: 'id-formal', label: 'Bahasa Indonesia (Formal)' },
    { value: 'en', label: 'English' },
]

export const HOOK_STYLE_OPTIONS: DropdownOption[] = [
    { value: 'question', label: 'Pertanyaan Provokatif', description: 'Buat penonton berpikir' },
    { value: 'fact', label: 'Fakta Mengejutkan', description: 'Statistik shocking' },
    { value: 'story', label: 'Cerita Personal', description: 'Relatable' },
    { value: 'problem', label: 'Problem Statement', description: 'Pain point' },
    { value: 'direct', label: 'Langsung ke Poin', description: 'No intro' },
]

// Default values
export const DEFAULT_DURATION = '3m'
export const DEFAULT_PLATFORM = 'youtube'
export const DEFAULT_TONE = 'casual'
export const DEFAULT_FORMAT = 'monolog'
export const DEFAULT_LANGUAGE = 'id-casual'
export const DEFAULT_HOOK_STYLE = 'question'
