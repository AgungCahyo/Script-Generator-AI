// Credit cost constants
export const CREDIT_COSTS = {
    // Script generation: base + per minute
    SCRIPT_BASE: 5,
    SCRIPT_PER_MINUTE: 1, // 1 min = 6 credits, 10 min = 15 credits

    // Text-to-Speech
    TTS_SECTION: 3, // Per section TTS generation

    // Media search
    IMAGE_SEARCH_PER_5: 1, // 1 credit per 5 images
    VIDEO_SEARCH: 2, // Per video

    // Storage (future use)
    STORAGE_PER_GB_MONTH: 5,
} as const

// Plan configuration
export const PLAN_LIMITS = {
    FREE: {
        creditsPerMonth: 0,
        startingCredits: 25, // Generous starting credits for better onboarding
        rolloverLimit: 0,
        discountPercent: 0,
    },
    CREATOR: {
        creditsPerMonth: 100,
        rolloverLimit: 50,
        discountPercent: 20, // 20% bonus on credit purchases
    },
    PRO: {
        creditsPerMonth: 500,
        rolloverLimit: Infinity,
        discountPercent: 40, // 40% bonus on credit purchases
    },
} as const

// Credit package prices (in IDR)
export const CREDIT_PACKAGES = {
    SMALL: {
        credits: 50,
        priceIDR: 199000,
        priceUSD: 15,
    },
    MEDIUM: {
        credits: 100,
        priceIDR: 349000,
        priceUSD: 25,
    },
    LARGE: {
        credits: 500,
        priceIDR: 1399000,
        priceUSD: 99,
    },
} as const

// Subscription prices (in IDR)
export const SUBSCRIPTION_PRICES = {
    CREATOR: {
        monthly: {
            priceIDR: 399000, // ~$27
            priceUSD: 29,
        },
    },
    PRO: {
        monthly: {
            priceIDR: 1399000, // ~$93
            priceUSD: 99,
        },
    },
} as const

// Credit warning thresholds
export const CREDIT_WARNINGS = {
    LOW: 0.2, // 20% remaining
    VERY_LOW: 0.1, // 10% remaining
    CRITICAL: 0.05, // 5% remaining
} as const
