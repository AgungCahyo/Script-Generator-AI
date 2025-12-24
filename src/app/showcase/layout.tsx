'use client'

import { AudioProvider } from '@/contexts/AudioContext'
import { ToastProvider } from '@/components/Toast'

export default function ShowcaseLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AudioProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </AudioProvider>
    )
}
