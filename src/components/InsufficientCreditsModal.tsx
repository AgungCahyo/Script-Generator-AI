'use client'

import { WalletOutline, CloseOutline, CardOutline } from 'react-ionicons'
import Link from 'next/link'
import CoinIcon from '@/components/icons/CoinIcon'

interface InsufficientCreditsModalProps {
    isOpen: boolean
    onClose: () => void
    required: number
    available: number
}

export default function InsufficientCreditsModal({
    isOpen,
    onClose,
    required,
    available
}: InsufficientCreditsModalProps) {
    if (!isOpen) return null

    const shortage = required - available

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                    <CloseOutline color="currentColor" width="20px" height="20px" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                        <WalletOutline color="#dc2626" width="32px" height="32px" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-neutral-900 text-center mb-2">
                    Insufficient Credits
                </h2>

                {/* Message */}
                <p className="text-neutral-600 text-center mb-6 flex items-center justify-center gap-1 flex-wrap">
                    You need <strong className="inline-flex items-center gap-0.5">{required} <CoinIcon className="w-3 h-3" /></strong> but only have <strong className="inline-flex items-center gap-0.5">{available} <CoinIcon className="w-3 h-3" /></strong> available.
                </p>

                {/* Shortage */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Credits needed:</span>
                        <span className="text-lg font-bold text-red-600">+{shortage}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/pricing"
                        className="block w-full py-3 text-center text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                        onClick={onClose}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CardOutline color="currentColor" width="16px" height="16px" />
                            Buy Credits
                        </div>
                    </Link>

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-sm font-medium border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-neutral-500 text-center mt-4">
                    💡 Subscribe to get monthly credits and bonuses
                </p>
            </div>
        </div>
    )
}
