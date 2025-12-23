'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CloseOutline } from 'react-ionicons'

interface ConfirmOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'default'
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function useConfirm() {
    const context = useContext(ConfirmContext)
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider')
    }
    return context
}

interface ConfirmProviderProps {
    children: ReactNode
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean
    resolve: ((value: boolean) => void) | null
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        message: '',
        resolve: null
    })

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                ...options,
                resolve
            })
        })
    }, [])

    const handleConfirm = () => {
        state.resolve?.(true)
        setState(prev => ({ ...prev, isOpen: false, resolve: null }))
    }

    const handleCancel = () => {
        state.resolve?.(false)
        setState(prev => ({ ...prev, isOpen: false, resolve: null }))
    }

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {state.isOpen && (
                <ConfirmModal
                    title={state.title}
                    message={state.message}
                    confirmText={state.confirmText}
                    cancelText={state.cancelText}
                    variant={state.variant}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmContext.Provider>
    )
}

interface ConfirmModalProps {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'default'
    onConfirm: () => void
    onCancel: () => void
}

function ConfirmModal({
    title = 'Konfirmasi',
    message,
    confirmText = 'Ya',
    cancelText = 'Batal',
    variant = 'default',
    onConfirm,
    onCancel
}: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xs bg-white rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                    aria-label="Close"
                >
                    <CloseOutline color="currentColor" width="16px" height="16px" />
                </button>

                {/* Content */}
                <div className="p-4 pr-10">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                        {title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-4 pb-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
