'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CloseOutline, SaveOutline } from 'react-ionicons'

interface ScriptEditorModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (visual: string, narasi: string) => void
    initialVisual: string
    initialNarasi: string
    timestamp: string
}

export default function ScriptEditorModal({
    isOpen,
    onClose,
    onSave,
    initialVisual,
    initialNarasi,
    timestamp
}: ScriptEditorModalProps) {
    const [visual, setVisual] = useState(initialVisual)
    const [narasi, setNarasi] = useState(initialNarasi)
    const [isMounted, setIsMounted] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setVisual(initialVisual)
            setNarasi(initialNarasi)
            setTimeout(() => setIsMounted(true), 10)
            document.body.style.overflow = 'hidden'
        } else {
            setIsMounted(false)
            setIsClosing(false)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, initialVisual, initialNarasi])

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
        }
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen])

    const handleClose = () => {
        setIsClosing(true)
        setTimeout(onClose, 200)
    }

    const handleSave = () => {
        onSave(visual, narasi)
        handleClose()
    }

    if (!isOpen || typeof document === 'undefined') return null

    return createPortal(
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-200 ${isClosing ? 'scale-95 opacity-0' : (isOpen && isMounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0')}`}>
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors z-10"
                    aria-label="Close"
                >
                    <CloseOutline color="currentColor" width="16px" height="16px" />
                </button>

                {/* Header */}
                <div className="px-5 pt-4 pb-3 pr-12">
                    <h3 className="text-sm font-semibold text-neutral-900">Edit Section</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{timestamp}</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
                    {/* Visual Field */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                            VISUAL
                        </label>
                        <textarea
                            value={visual}
                            onChange={(e) => {
                                const value = e.target.value
                                if (value.length <= 500) {
                                    setVisual(value)
                                }
                            }}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                            placeholder="Deskripsi visual yang akan tampil di layar..."
                            maxLength={500}
                        />
                        <div className={`text-xs mt-1 text-right ${visual.length >= 500 ? 'text-red-500 font-medium' : visual.length >= 450 ? 'text-yellow-600' : 'text-neutral-400'}`}>
                            {visual.length}/500 karakter
                        </div>
                    </div>

                    {/* Narasi Field */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                            NARASI
                        </label>
                        <textarea
                            value={narasi}
                            onChange={(e) => {
                                const value = e.target.value
                                if (value.length <= 1000) {
                                    setNarasi(value)
                                }
                            }}
                            rows={10}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                            placeholder="Teks yang akan dibacakan (untuk TTS)..."
                            maxLength={1000}
                        />
                        <div className={`text-xs mt-1 text-right ${narasi.length >= 1000 ? 'text-red-500 font-medium' : narasi.length >= 900 ? 'text-yellow-600' : 'text-neutral-400'}`}>
                            {narasi.length}/1000 karakter
                        </div>
                        <p className="mt-1.5 text-xs text-neutral-500">
                            Tip: Narasi harus bersih dari markup atau label struktural
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-5 pb-4 pt-2">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!visual.trim() || !narasi.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        <SaveOutline color="currentColor" width="14px" height="14px" />
                        Simpan
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
