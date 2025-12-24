'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CheckmarkCircleOutline, ArrowBack, StarOutline } from 'react-ionicons'
import Link from 'next/link'
import { CREDIT_PACKAGES } from '@/lib/constants/credits'
import CoinIcon from '@/components/icons/CoinIcon'
import LoadingScreen from '@/components/LoadingScreen'

// Credit pack options - derived from constants
const CREDIT_PACKS = [
    {
        credits: CREDIT_PACKAGES.STARTER.credits,
        price: CREDIT_PACKAGES.STARTER.priceIDR,
        originalPrice: 35000,
        bonusCredits: Math.floor(CREDIT_PACKAGES.STARTER.credits * 0.2),
        label: 'Starter',
        popular: false
    },
    {
        credits: CREDIT_PACKAGES.SMALL.credits,
        price: CREDIT_PACKAGES.SMALL.priceIDR,
        originalPrice: 160000,
        bonusCredits: Math.floor(CREDIT_PACKAGES.SMALL.credits * 0.2),
        label: 'Popular',
        popular: true
    },
    {
        credits: CREDIT_PACKAGES.MEDIUM.credits,
        price: CREDIT_PACKAGES.MEDIUM.priceIDR,
        originalPrice: 320000,
        bonusCredits: Math.floor(CREDIT_PACKAGES.MEDIUM.credits * 0.2),
        label: 'Pro',
        popular: false
    },
    {
        credits: CREDIT_PACKAGES.LARGE.credits,
        price: CREDIT_PACKAGES.LARGE.priceIDR,
        originalPrice: 650000,
        bonusCredits: Math.floor(CREDIT_PACKAGES.LARGE.credits * 0.2),
        label: 'Agency',
        popular: false
    },
]

export default function PricingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [loading, setLoading] = useState<number | null>(null)
    const [credits, setCredits] = useState(0)
    const [hasEverPurchased, setHasEverPurchased] = useState(false)
    const [checkingHistory, setCheckingHistory] = useState(true)
    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        if (user) {
            loadInitialData()
        } else {
            setCheckingHistory(false)
            setInitialLoading(false)
        }
    }, [user])

    const loadInitialData = async () => {
        try {
            // Wait for both fetches to complete
            await Promise.all([
                fetchCreditBalance(),
                checkPurchaseHistory()
            ])
        } finally {
            setInitialLoading(false)
        }
    }

    const fetchCreditBalance = async () => {
        if (!user) return

        try {
            const token = await user.getIdToken()
            const response = await fetch('/api/credits/balance', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setCredits(data.credits || 0)
        } catch (error) {
            console.error('Failed to fetch credits:', error)
        }
    }

    const checkPurchaseHistory = async () => {
        if (!user) return

        try {
            const token = await user.getIdToken()
            const response = await fetch('/api/credits/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()

            // Check if user has any PURCHASE transactions
            const hasPurchases = data.transactions?.some(
                (t: any) => t.type === 'PURCHASE'
            ) || false

            setHasEverPurchased(hasPurchases)
        } catch (error) {
            console.error('Failed to fetch purchase history:', error)
            setHasEverPurchased(false)
        } finally {
            setCheckingHistory(false)
        }
    }

    const handleBuyCredits = async (packCredits: number) => {
        if (!user) {
            router.push('/')
            return
        }

        setLoading(packCredits)
        try {
            const token = await user.getIdToken()
            const response = await fetch('/api/billing/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ credits: packCredits })
            })

            const data = await response.json()
            if (data.paymentUrl) {
                // Store payment URL in localStorage for later retrieval
                if (data.orderId) {
                    localStorage.setItem(`payment_${data.orderId}`, data.paymentUrl)
                }
                window.location.href = data.paymentUrl
            } else {
                alert('Failed to create checkout')
            }
        } catch (error) {
            alert('An error occurred')
        } finally {
            setLoading(null)
        }
    }

    const formatIDR = (amount: number) => {
        if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`
        if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}K`
        return `Rp ${amount.toLocaleString('id-ID')}`
    }

    // Show loading screen while checking initial data
    if (initialLoading && user) {
        return <LoadingScreen message="Loading pricing data..." />
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                title="Back to home"
                            >
                                <ArrowBack color="currentColor" width="20px" height="20px" />
                            </Link>
                            <h1 className="text-lg font-semibold text-neutral-900">Pricing</h1>
                        </div>
                        {user && (
                            <div className="text-sm text-neutral-600 flex items-center gap-1.5">
                                Saldo:
                                <span className="font-semibold text-neutral-900 flex items-center gap-1">
                                    {credits} <CoinIcon className="w-4 h-4" />
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w- 6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
                        Beli Kredit
                    </h2>
                    <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                        {(!user || !hasEverPurchased) ? (
                            <><strong className="text-green-600">Bonus 20% Credits</strong> untuk pembelian pertama kamu!</>
                        ) : (
                            <>Pilih paket kredit yang sesuai kebutuhan kamu.</>
                        )}
                    </p>
                </div>

                {/* Credit Packs */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {CREDIT_PACKS.map((pack) => (
                        <div
                            key={pack.credits}
                            className={`bg-white rounded-xl p-6 ${pack.popular
                                ? 'border-2 border-neutral-900 shadow-lg relative'
                                : 'border border-neutral-200'
                                }`}
                        >
                            {pack.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                    BEST VALUE
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-4">
                                <StarOutline
                                    color={pack.popular ? '#171717' : '#737373'}
                                    width="20px"
                                    height="20px"
                                />
                                <h3 className="text-lg font-semibold text-neutral-900">{pack.label}</h3>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-neutral-900">{pack.credits}</span>
                                    <CoinIcon className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    {/* Show original price with strikethrough */}
                                    <div className="text-sm text-neutral-400 line-through">
                                        {formatIDR(pack.originalPrice)}
                                    </div>
                                    <div className="text-neutral-900 text-xl font-bold">
                                        {formatIDR(pack.price)}
                                    </div>
                                    {/* Show bonus for first-time buyers */}
                                    {(!user || !hasEverPurchased) && pack.bonusCredits && (
                                        <div className="mt-2 pt-2 border-t border-neutral-100">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-semibold text-green-600 inline-flex items-center gap-0.5">+{pack.bonusCredits} <CoinIcon className="w-3 h-3" /> bonus</span>
                                                <span className="text-xs text-neutral-400">(first purchase)</span>
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-0.5 inline-flex items-center gap-1">
                                                Total: <strong className="inline-flex items-center gap-0.5">{pack.credits + pack.bonusCredits} <CoinIcon className="w-3 h-3" /></strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-2 mb-6 text-sm">
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckmarkCircleOutline color="#22c55e" width="16px" height="16px" />
                                    ~{Math.floor(pack.credits / 30)} script (model standar)
                                </li>
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckmarkCircleOutline color="#22c55e" width="16px" height="16px" />
                                    ~{Math.floor(pack.credits / 30)} TTS sections
                                </li>
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckmarkCircleOutline color="#22c55e" width="16px" height="16px" />
                                    ~{pack.credits * 0.5} images • ~{Math.floor(pack.credits / 20)} videos
                                </li>
                            </ul>

                            <button
                                onClick={() => handleBuyCredits(pack.credits)}
                                disabled={loading === pack.credits || !user}
                                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pack.popular
                                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                                    : 'border border-neutral-300 text-neutral-900 hover:bg-neutral-50'
                                    }`}
                            >
                                {loading === pack.credits ? 'Tunggu sebentar...' : 'Beli Sekarang'}
                            </button>
                        </div>
                    ))}
                </div>

                {!user && (
                    <p className="text-center text-sm text-neutral-500 mt-6">
                        Login dulu yuk buat beli credits
                    </p>
                )}

                {/* Features Info */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pakai Credit Buat Apa?</h3>
                    <div className="grid sm:grid-cols-3 gap-6 text-sm">
                        <div>
                            <div className="font-semibold text-neutral-900 mb-2">Generate Script</div>
                            <div className="text-neutral-600">
                                <div className="mb-1"><strong>Hemat:</strong> 20 credits (Flash-Lite)</div>
                                <div className="mb-1"><strong>Standar:</strong> 30 credits (Flash)</div>
                                <div><strong>Premium:</strong> 50 credits (Pro)</div>
                                <div className="text-xs text-neutral-400 mt-2">+ 10 credits per menit durasi</div>
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold text-neutral-900 mb-2">Text-to-Speech</div>
                            <div className="text-neutral-600">30 credits per section narasi</div>
                        </div>
                        <div>
                            <div className="font-semibold text-neutral-900 mb-2">Search Media</div>
                            <div className="text-neutral-600">10 credits per 5 gambar • 20 credits per video</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
