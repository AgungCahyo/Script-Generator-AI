'use client'

import { useState, useEffect } from 'react'
import AudioPlayer from './AudioPlayer'

interface Script {
    id: string
    topic: string
    script: string | null
    audioUrl: string | null
    status: string
    error: string | null
    createdAt: string
    updatedAt: string
}

interface ScriptModalProps {
    script: Script | null
    isOpen: boolean
    onClose: () => void
    onGenerateAudio: () => void
    generatingAudio: boolean
}

export default function ScriptModal({
    script,
    isOpen,
    onClose,
    onGenerateAudio,
    generatingAudio
}: ScriptModalProps) {
    const [copied, setCopied] = useState(false)

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen || !script) return null

    const copyToClipboard = () => {
        if (script.script) {
            navigator.clipboard.writeText(script.script)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col bg-neutral-100 rounded-lg shadow-2xl overflow-hidden">
                {/* Toolbar - MS Word style */}
                <div className="flex-shrink-0 bg-white border-b border-neutral-200">
                    {/* Title bar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                            </svg>
                            <span className="text-sm font-medium text-neutral-700 truncate max-w-md">
                                {script.topic}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Toolbar buttons */}
                    <div className="flex items-center gap-1 px-3 py-1.5">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {copied ? 'Copied!' : 'Copy'}
                        </button>

                        <div className="w-px h-4 bg-neutral-200 mx-1" />

                        {script.audioUrl ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Audio Generated
                            </span>
                        ) : (
                            <button
                                onClick={onGenerateAudio}
                                disabled={generatingAudio || !script.script}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {generatingAudio ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                        Generate Audio
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Document area - MS Word paper style */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-3xl mx-auto bg-white rounded shadow-sm border border-neutral-200 min-h-full">
                        {/* Page content */}
                        <div className="p-12">
                            {/* Header */}
                            <div className="mb-8 pb-6 border-b border-neutral-100">
                                <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
                                    {script.topic}
                                </h1>
                                <p className="text-xs text-neutral-400">
                                    Created: {formatDate(script.createdAt)}
                                </p>
                            </div>

                            {/* Audio Player */}
                            {script.audioUrl && (
                                <div className="mb-6">
                                    <AudioPlayer src={script.audioUrl} />
                                </div>
                            )}

                            {/* Script Content */}
                            {script.script ? (
                                <div className="prose prose-neutral max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-neutral-700 p-0 m-0 bg-transparent border-0">
                                        {script.script}
                                    </pre>
                                </div>
                            ) : script.status === 'processing' ? (
                                <div className="py-16 text-center">
                                    <svg className="animate-spin h-6 w-6 mx-auto text-neutral-400 mb-3" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <p className="text-sm text-neutral-500">Generating script...</p>
                                </div>
                            ) : script.status === 'failed' ? (
                                <div className="py-16 text-center">
                                    <p className="text-sm text-red-600">{script.error || 'Failed to generate script'}</p>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="px-12 py-4 border-t border-neutral-100 text-center">
                            <p className="text-xs text-neutral-400">
                                Script Generator • Page 1 of 1
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status bar */}
                <div className="flex-shrink-0 bg-blue-600 px-4 py-1 flex items-center justify-between text-xs text-white">
                    <span>
                        {script.script ? `${script.script.length.toLocaleString()} characters` : 'No content'}
                    </span>
                    <span className="capitalize">{script.status}</span>
                </div>
            </div>
        </div>
    )
}
