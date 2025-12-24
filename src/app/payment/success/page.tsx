'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckmarkCircleOutline } from 'react-ionicons'
import Link from 'next/link'
import LoadingScreen from '@/components/LoadingScreen'

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [countdown, setCountdown] = useState(5)
    const [redirecting, setRedirecting] = useState(false)

    const orderId = searchParams.get('order_id')
    const transactionStatus = searchParams.get('transaction_status')

    // Redirect to pending page if transaction is not actually successful
    useEffect(() => {
        if (transactionStatus && transactionStatus !== 'settlement' && transactionStatus !== 'capture') {
            // Show loading immediately to prevent flash
            setRedirecting(true)
            // Transaction is pending, denied, expired, or cancelled
            router.replace(`/payment/pending?order_id=${orderId || ''}`)
            return
        }
    }, [transactionStatus, orderId, router])

    // Countdown timer for auto-redirect to dashboard
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    router.push('/dashboard/billing')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router])

    // Show loading screen while redirecting (after all hooks)
    if (redirecting) {
        return <LoadingScreen message="Redirecting..." />
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-50 border-2 border-green-500 rounded-full flex items-center justify-center">
                        <CheckmarkCircleOutline color="#22c55e" width="40px" height="40px" />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        Pembayaran Berhasil!
                    </h1>
                    <p className="text-neutral-600">
                        Makasih udah beli! Kredit kamu bakal nambah sebentar lagi.
                    </p>
                </div>

                {/* Order Info Card */}
                {orderId && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">ID Order</div>
                        <div className="text-sm font-mono font-medium text-neutral-900 mb-4">{orderId}</div>

                        <div className="pt-4 border-t border-neutral-100">
                            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Credits will be added shortly
                            </div>
                        </div>
                    </div>
                )}

                {/* Countdown */}
                <div className="text-sm text-neutral-500">
                    Nanti dialihin ke dashboard dalam <span className="font-semibold text-neutral-900">{countdown}s</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/dashboard/billing"
                        className="flex-1 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors text-center"
                    >
                        Ke Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 px-4 py-2.5 border border-neutral-300 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors text-center"
                    >
                        Balik ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-neutral-400">Loading...</div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}
