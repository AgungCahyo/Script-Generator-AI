'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import {
    CheckmarkCircleOutline,
    AlertCircleOutline,
    InformationCircleOutline,
    WarningOutline,
    CloseOutline
} from 'react-ionicons'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void
    showSuccess: (message: string, duration?: number) => void
    showError: (message: string, duration?: number) => void
    showInfo: (message: string, duration?: number) => void
    showWarning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

interface ToastProviderProps {
    children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newToast: Toast = { id, message, type, duration }

        setToasts(prev => [...prev, newToast])

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration)
        }
    }, [removeToast])

    const showSuccess = useCallback((message: string, duration?: number) => {
        showToast(message, 'success', duration)
    }, [showToast])

    const showError = useCallback((message: string, duration?: number) => {
        showToast(message, 'error', duration ?? 5000) // Errors stay longer
    }, [showToast])

    const showInfo = useCallback((message: string, duration?: number) => {
        showToast(message, 'info', duration)
    }, [showToast])

    const showWarning = useCallback((message: string, duration?: number) => {
        showToast(message, 'warning', duration ?? 4000)
    }, [showToast])

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

interface ToastContainerProps {
    toasts: Toast[]
    onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-100 flex flex-col gap-2 sm:min-w-[320px] sm:max-w-[420px]">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    )
}

interface ToastItemProps {
    toast: Toast
    onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const config = {
        success: {
            bg: 'bg-white border-neutral-200',
            text: 'text-neutral-800',
            icon: <CheckmarkCircleOutline color="#000000" width="20px" height="20px" />
        },
        error: {
            bg: 'bg-white border-neutral-200',
            text: 'text-neutral-800',
            icon: <AlertCircleOutline color="#000000" width="20px" height="20px" />
        },
        info: {
            bg: 'bg-white border-neutral-200',
            text: 'text-neutral-800',
            icon: <InformationCircleOutline color="#000000" width="20px" height="20px" />
        },
        warning: {
            bg: 'bg-white border-neutral-200',
            text: 'text-neutral-800',
            icon: <WarningOutline color="#000000" width="20px" height="20px" />
        }
    }

    const { bg, text, icon } = config[toast.type]

    return (
        <div
            className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg border shadow-lg ${bg} animate-slide-in`}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">
                {icon}
            </div>
            <p className={`flex-1 text-sm ${text}`}>
                {toast.message}
            </p>
            <button
                onClick={() => onRemove(toast.id)}
                className={`shrink-0 p-1 rounded hover:bg-black/5 transition-colors ${text}`}
                aria-label="Dismiss"
            >
                <CloseOutline color="currentColor" width="16px" height="16px" />
            </button>
        </div>
    )
}
