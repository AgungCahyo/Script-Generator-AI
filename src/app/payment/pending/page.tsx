'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TimeOutline } from 'react-ionicons'
import Link from 'next/link'

function PaymentPendingContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

    // Retrieve payment URL from localStorage
    useEffect(() => {
        if (orderId) {
            const storedUrl = localStorage.getItem(`payment_${orderId}`)
            setPaymentUrl(storedUrl)
        }
    }, [orderId])

    const handleContinuePayment = () => {
        if (paymentUrl) {
            window.location.href = paymentUrl
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Pending Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
                        <TimeOutline color="#ea580c" width="48px" height="48px" />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        Nunggu Konfirmasi Pembayaran
                    </h1>
                    <p className="text-neutral-600">
                        Transaksi kamu lagi diproses nih. Tunggu sebentar ya!
                    </p>
                </div>

                {/* Order Info */}
                {orderId && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <div className="text-xs text-neutral-500 uppercase tracking-wide">ID Order</div>
                        <div className="text-base font-mono font-medium text-neutral-900">{orderId}</div>
                        <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                Verification in progress
                            </div>
                        </div>
                    </div>
                )}

                {/* Info */}
                <p className="text-sm text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    Biasanya sih cuma butuh waktu sebentar. Kamu bisa kok tinggalin halaman ini, nanti kita kabarin lewat email kalau udah beres.
                </p>

                {/* Actions */}
                <div className="flex gap-4">
                    {paymentUrl && (
                        <button
                            onClick={handleContinuePayment}
                            className="w-full px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors text-center"
                        >
                            Lanjutkan Pembayaran
                        </button>
                    )}
                    <Link
                        href="/dashboard/billing"
                        className="w-full px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors text-center"
                    >
                        Cek Status di Dashboard
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

export default function PaymentPendingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-neutral-400">Loading...</div>
            </div>
        }>
            <PaymentPendingContent />
        </Suspense>
    )
}
