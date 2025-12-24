'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CloseCircleOutline } from 'react-ionicons'
import Link from 'next/link'

function PaymentErrorContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')
    const statusMessage = searchParams.get('status_message')

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-50 border-2 border-red-500 rounded-full flex items-center justify-center">
                        <CloseCircleOutline color="#ef4444" width="40px" height="40px" />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        Waduh, Pembayaran Gagal
                    </h1>
                    <p className="text-neutral-600">
                        Ada masalah sama pembayaran kamu nih. Coba lagi ya!
                    </p>
                </div>

                {/* Order Info Card */}
                {orderId && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">ID Order</div>
                        <div className="text-sm font-mono font-medium text-neutral-900 mb-4">{orderId}</div>

                        <div className="pt-4 border-t border-neutral-100">
                            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                                <CloseCircleOutline color="currentColor" width="16px" height="16px" />
                                Your card was not charged
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {statusMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">{statusMessage}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/pricing"
                        className="flex-1 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors text-center"
                    >
                        Coba Lagi
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

export default function PaymentErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-neutral-400">Loading...</div>
            </div>
        }>
            <PaymentErrorContent />
        </Suspense>
    )
}
