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
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* Pending Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-orange-50 border-2 border-orange-500 rounded-full flex items-center justify-center">
                        <TimeOutline color="#f97316" width="40px" height="40px" />
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

                {/* Order Info Card */}
                {orderId && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">ID Order</div>
                        <div className="text-sm font-mono font-medium text-neutral-900 mb-4">{orderId}</div>

                        <div className="pt-4 border-t border-neutral-100">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
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
                <div className="flex flex-col sm:flex-row gap-3">
                    {paymentUrl && (
                        <button
                            onClick={handleContinuePayment}
                            className="flex-1 px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors text-center"
                        >
                            Lanjutkan Pembayaran
                        </button>
                    )}
                    <Link
                        href="/dashboard/billing"
                        className="flex-1 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors text-center"
                    >
                        Cek Status di Dashboard
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

export default function PaymentPendingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-neutral-400">Loading...</div>
            </div>
        }>
            <PaymentPendingContent />
        </Suspense>
    )
}
