'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { WalletOutline, CardOutline, TimeOutline, ArrowBack, TrendingUpOutline, TrendingDownOutline } from 'react-ionicons'
import Link from 'next/link'

interface Transaction {
    id: string
    amount: number
    type: string
    description: string
    balanceAfter: number
    createdAt: string
}

export default function BillingDashboardPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [credits, setCredits] = useState(0)
    const [creditsPurchased, setcreditsPurchased] = useState(0)
    const [creditsUsed, setCreditsUsed] = useState(0)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [transactionPage, setTransactionPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        if (!user) {
            router.push('/')
            return
        }
        fetchBillingData()
    }, [user])

    const fetchBillingData = async () => {
        if (!user) return

        try {
            const token = await user.getIdToken()

            // Fetch balance
            const balanceRes = await fetch('/api/credits/balance', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const balanceData = await balanceRes.json()

            setCredits(balanceData.credits || 0)
            setcreditsPurchased(balanceData.creditsPurchased || 0)
            setCreditsUsed(balanceData.creditsUsed || 0)

            // Fetch transactions
            const historyRes = await fetch('/api/credits/history?limit=10&page=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const historyData = await historyRes.json()

            setTransactions(historyData.transactions || [])
            setHasMore(historyData.transactions?.length === 10)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const loadMoreTransactions = async () => {
        if (!user) return

        try {
            const token = await user.getIdToken()
            const nextPage = transactionPage + 1

            const res = await fetch(`/api/credits/history?limit=10&page=${nextPage}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.transactions?.length > 0) {
                setTransactions([...transactions, ...data.transactions])
                setTransactionPage(nextPage)
                setHasMore(data.transactions.length === 10)
            } else {
                setHasMore(false)
            }
        } catch (error) {
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTransactionColor = (type: string) => {
        if (type === 'USAGE') return 'text-red-600'
        if (type === 'PURCHASE' || type === 'MONTHLY_GRANT' || type === 'BONUS') return 'text-green-600'
        return 'text-neutral-600'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-neutral-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Back to home"
                        >
                            <ArrowBack color="currentColor" width="20px" height="20px" />
                        </Link>
                        <h1 className="text-2xl font-bold text-neutral-900">Dashboard Billing</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
                {/* Credit Balance - Hero Section */}
                <div className="bg-linear-to-br from-neutral-900 to-neutral-800 rounded-xl p-6 sm:p-8 text-white">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 text-neutral-300 text-sm mb-2">
                                <WalletOutline color="currentColor" width="18px" height="18px" />
                                Current Balance
                            </div>
                            <div className="text-5xl font-bold">{credits}</div>
                            <p className="text-sm text-neutral-400 mt-1">kredit tersedia</p>
                        </div>
                        <Link
                            href="/pricing"
                            className="px-4 py-2 text-sm font-medium bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            Beli Kredit
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                        <div>
                            <div className="flex items-center gap-1.5 text-green-400 text-sm mb-1">
                                <TrendingUpOutline color="currentColor" width="16px" height="16px" />
                                Dibeli
                            </div>
                            <div className="text-2xl font-semibold">{creditsPurchased}</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 text-neutral-400 text-sm mb-1">
                                <TrendingDownOutline color="currentColor" width="16px" height="16px" />
                                Terpakai
                            </div>
                            <div className="text-2xl font-semibold">{creditsUsed}</div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-neutral-900 mb-4">Riwayat Transaksi</h2>

                    {transactions.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500 text-sm">
                            Belum ada transaksi
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between py-3 px-3 -mx-3 hover:bg-neutral-50 rounded-lg transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-neutral-900 truncate">
                                            {tx.description}
                                        </div>
                                        <div className="text-xs text-neutral-500">Kredit Bulanan</div>
                                    </div>
                                    <div className="text-right ml-4 shrink-0">
                                        <div className={`text-sm font-semibold ${getTransactionColor(tx.type)}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            Bal: {tx.balanceAfter}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {hasMore && (
                                <button
                                    onClick={loadMoreTransactions}
                                    className="w-full py-3 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                                >
                                    Muat Lebih Banyak
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
