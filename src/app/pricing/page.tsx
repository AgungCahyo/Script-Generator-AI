'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CheckmarkCircleOutline, ArrowBack, StarOutline } from 'react-ionicons'
import Link from 'next/link'

// Credit pack options with Rp 2,000 per credit
const CREDIT_PACKS = [
    { credits: 10, price: 20000, label: 'Starter', popular: false },
    { credits: 50, price: 100000, label: 'Popular', popular: true },
    { credits: 100, price: 200000, label: 'Pro', popular: false },
    { credits: 500, price: 1000000, label: 'Agency', popular: false },
]

export default function PricingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [loading, setLoading] = useState<number | null>(null)
    const [credits, setCredits] = useState(0)

    useEffect(() => {
        if (user) {
            fetchCreditBalance()
        }
    }, [user])

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
                            <div className="text-sm text-neutral-600">
                                Saldo: <span className="font-semibold text-neutral-900">{credits} credits</span>
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
                        Pilih paket kredit yang sesuai kebutuhan kamu. Harga tetap di <strong>Rp 2.000 per credit</strong>.
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
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-bold text-neutral-900">{pack.credits}</span>
                                    <span className="text-neutral-500 text-sm">credits</span>
                                </div>
                                <div className="text-neutral-600 text-base font-medium">
                                    {formatIDR(pack.price)}
                                </div>
                                <div className="text-xs text-neutral-400 mt-1">
                                    Rp 2.000 / credit
                                </div>
                            </div>

                            <ul className="space-y-2 mb-6 text-sm">
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckmarkCircleOutline color="#22c55e" width="16px" height="16px" />
                                    Generate {Math.floor(pack.credits / 50)} script (50 credits)
                                </li>
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckmarkCircleOutline color="#22c55e" width="16px" height="16px" />
                                    TTS narasi {Math.floor(pack.credits / 3)} section (3 credits)
                                </li>
                                <li className="flex items-center gap-2 text-neutral-700">
                                    <CheckmarkCircleOutline color="#22c55e" width="16px" height="16px" />
                                    Search media {Math.floor(pack.credits / 2)} kali (2 credits)
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
                            <div className="text-neutral-600">50 credits per script (30-120 detik)</div>
                        </div>
                        <div>
                            <div className="font-semibold text-neutral-900 mb-2">Text-to-Speech</div>
                            <div className="text-neutral-600">3 credits per section narasi</div>
                        </div>
                        <div>
                            <div className="font-semibold text-neutral-900 mb-2">Search Media</div>
                            <div className="text-neutral-600">2 credits per pencarian gambar/video</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
