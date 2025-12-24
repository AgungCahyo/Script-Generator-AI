'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckmarkCircleOutline } from 'react-ionicons'
import Link from 'next/link'

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [countdown, setCountdown] = useState(5)

    const orderId = searchParams.get('order_id')
    const transactionStatus = searchParams.get('transaction_status')

    // Redirect to pending page if transaction is not actually successful
    useEffect(() => {
        if (transactionStatus && transactionStatus !== 'settlement' && transactionStatus !== 'capture') {
            // Transaction is pending, denied, expired, or cancelled
            router.replace(`/payment/pending?order_id=${orderId || ''}`)
            return
        }
    }, [transactionStatus, orderId, router])

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

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckmarkCircleOutline color="#16a34a" width="48px" height="48px" />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        Pembayaran Berhasil!
                    </h1>
                    <p className="text-neutral-600 mb-6">
                        Makasih udah beli! Kredit kamu bakal nambah sebentar lagi.
                    </p>
                </div>

                {/* Order Info */}
                {orderId && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-neutral-500 uppercase tracking-wide">ID Order</span>
                            <span className="text-sm font-mono text-neutral-900">{orderId || 'N/A'}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-sm text-neutral-600">
                            <p className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Credits will be added shortly
                            </p>
                        </div>
                    </div>
                )}

                {/* Redirect Info */}
                <div className="text-sm text-neutral-500">
                    Nanti dialihin ke dashboard dalam <span className="font-bold text-neutral-900">{countdown}s</span>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/dashboard/billing"
                        className="w-full px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors text-center"
                    >
                        Ke Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="w-full px-4 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors text-center"
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
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-neutral-400">Loading...</div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}
