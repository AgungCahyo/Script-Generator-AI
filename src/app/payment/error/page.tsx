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
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                        <CloseCircleOutline color="#dc2626" width="48px" height="48px" />
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

                {/* Order Info */}
                {orderId && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <span className="text-xs text-neutral-500 uppercase tracking-wide">ID Order</span>
                        <div className="text-base font-mono font-medium text-neutral-900">{orderId}</div>
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                            <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg">
                                Your card was not charged
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/pricing"
                        className="w-full px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors text-center"
                    >
                        Coba Lagi
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 py-3.5 text-sm font-medium border border-neutral-200 bg-white text-neutral-900 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function PaymentErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-neutral-400">Loading...</div>
            </div>
        }>
            <PaymentErrorContent />
        </Suspense>
    )
}
