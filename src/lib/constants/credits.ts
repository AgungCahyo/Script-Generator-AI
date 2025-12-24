// Credit cost constants (10x scale for better UX psychology)
export const CREDIT_COSTS = {
    // Script generation - TIERED BY MODEL (prevents expensive model abuse)
    SCRIPT_TIER_1: 20,  // Flash-Lite models (economy)
    SCRIPT_TIER_2: 30,  // Flash models (standard - RECOMMENDED)
    SCRIPT_TIER_3: 50,  // Pro models (premium)
    SCRIPT_PER_MINUTE: 10, // Additional per minute

    // Text-to-Speech
    TTS_SECTION: 30, // Per section TTS generation

    // Media search
    IMAGE_SEARCH_PER_5: 10, // 10 credits per 5 images
    VIDEO_SEARCH: 20, // Per video

    // Storage (future use)
    STORAGE_PER_GB_MONTH: 50,
} as const

// Model tier mapping (prevents spam of expensive models)
export const MODEL_TIERS = {
    // Tier 1: Economy (20 credits base) - API cost ~Rp 12
    'gemini-2.5-flash-lite': 1,

    // Tier 2: Standard (30 credits base) - API cost ~Rp 12-16 - RECOMMENDED
    'gemini-1.5-flash': 2,
    'gemini-2.5-flash': 2,
    'gemini-3-flash-preview': 2,

    // Tier 3: Premium (50 credits base) - API cost ~Rp 195-624
    'gemini-1.5-pro': 3,
    'gemini-2.5-pro': 3,
    'gemini-3-pro-preview': 3,
} as const

// Plan configuration (10x scale)
export const PLAN_LIMITS = {
    FREE: {
        creditsPerMonth: 0,
        startingCredits: 60, // 6 credits in old scale - enough for 2 scripts
        rolloverLimit: 0,
        discountPercent: 0,
    },
    CREATOR: {
        creditsPerMonth: 1000, // 100 in old scale
        rolloverLimit: 500, // 50 in old scale
        discountPercent: 20, // 20% bonus on credit purchases
    },
    PRO: {
        creditsPerMonth: 5000, // 500 in old scale
        rolloverLimit: Infinity,
        discountPercent: 40, // 40% bonus on credit purchases
    },
} as const

// Credit package prices (in IDR) - 10x scale
export const CREDIT_PACKAGES = {
    STARTER: {
        credits: 100, // 10 in old scale - ~2-3 scripts
        priceIDR: 25000,
        priceUSD: 2,
    },
    SMALL: {
        credits: 500, // 50 in old scale - ~10-15 scripts
        priceIDR: 125000,
        priceUSD: 8,
    },
    MEDIUM: {
        credits: 1000, // 100 in old scale - ~25-30 scripts
        priceIDR: 250000,
        priceUSD: 16,
    },
    LARGE: {
        credits: 2500, // 250 in old scale - ~60-70 scripts
        priceIDR: 500000,
        priceUSD: 33,
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
