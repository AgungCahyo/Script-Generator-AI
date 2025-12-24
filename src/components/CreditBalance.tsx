'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AddCircleOutline } from 'react-ionicons'
import Link from 'next/link'
import CoinIcon from '@/components/icons/CoinIcon'

interface CreditBalanceProps {
    onTopUpClick?: () => void
}

export default function CreditBalance({ onTopUpClick }: CreditBalanceProps) {
    const { user } = useAuth()
    const [credits, setCredits] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchBalance = async () => {
        if (!user) {
            setCredits(null)
            setLoading(false)
            return
        }

        try {
            const token = await user.getIdToken()
            const response = await fetch('/api/credits/balance', {
                headers: { 'Authorization': `Bearer ${token}` }
            })


            if (response.ok) {
                const data = await response.json()
                setCredits(data.credits)
            } else {
                const error = await response.json()
            }
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBalance()
    }, [user])

    // Refresh balance every 30 seconds
    useEffect(() => {
        if (!user) return

        const interval = setInterval(() => {
            fetchBalance()
        }, 30000)

        return () => clearInterval(interval)
    }, [user])

    if (!user || loading) {
        return null
    }

    const creditColor = credits === null || credits === 0
        ? 'text-red-600'
        : credits < 10
            ? 'text-orange-600'
            : 'text-neutral-900'

    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Credit Balance Display */}
            <Link
                href="/dashboard/billing"
                className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 hover:bg-neutral-50 rounded transition-colors group"
                title="View billing dashboard"
            >
                <div className="flex items-center gap-0.5 sm:gap-1">
                    <span className={`font-semibold text-sm ${creditColor}`}>
                        {credits ?? 0}
                    </span>
                    <CoinIcon className="w-4 h-4" />
                </div>
            </Link>

            {/* Divider */}
            <div className="w-px h-4 bg-neutral-200 hidden sm:block" />

            {/* Top-Up Button */}
            <button
                onClick={onTopUpClick}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors"
                title="Buy more credits"
            >
                <AddCircleOutline color="currentColor" width="14px" height="14px" />
                <span className="hidden sm:inline">Top Up</span>
            </button>
        </div>
    )
}
