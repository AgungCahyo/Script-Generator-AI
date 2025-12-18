'use client'

import { useState } from 'react'
import AudioPlayer from './AudioPlayer'

interface Script {
    id: string
    topic: string
    script: string | null
    audioUrl: string | null
    status: string
    error: string | null
}

interface ScriptResultProps {
    script: Script
    onRefresh: () => void
}

export default function ScriptResult({ script, onRefresh }: ScriptResultProps) {
    const [generatingAudio, setGeneratingAudio] = useState(false)
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        if (script.script) {
            navigator.clipboard.writeText(script.script)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const generateAudio = async () => {
        setGeneratingAudio(true)
        try {
            const res = await fetch(`/api/scripts/${script.id}/generate-audio`, {
                method: 'POST',
            })
            const data = await res.json()
            if (!data.success) {
                alert(data.error || 'Failed to start audio generation')
            }
            // Start polling for audio
            const pollAudio = setInterval(async () => {
                const scriptRes = await fetch(`/api/scripts/${script.id}`)
                const scriptData = await scriptRes.json()
                if (scriptData.script?.audioUrl) {
                    clearInterval(pollAudio)
                    setGeneratingAudio(false)
                    onRefresh()
                }
            }, 3000)
            // Timeout after 2 minutes
            setTimeout(() => {
                clearInterval(pollAudio)
                setGeneratingAudio(false)
            }, 120000)
        } catch (error) {
            console.error('Error generating audio:', error)
            setGeneratingAudio(false)
        }
    }

    const getStatusBadge = () => {
        const base = 'text-xs px-2 py-0.5 rounded-full'
        switch (script.status) {
            case 'completed':
                return `${base} bg-green-50 text-green-700`
            case 'processing':
                return `${base} bg-amber-50 text-amber-700`
            default:
                return `${base} bg-red-50 text-red-700`
        }
    }

    return (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                <span className="text-sm text-neutral-900 font-medium">{script.topic}</span>
                <span className={getStatusBadge()}>{script.status}</span>
            </div>

            {/* Content */}
            <div className="p-4">
                {script.status === 'processing' && (
                    <div className="py-12 text-center">
                        <svg className="animate-spin h-5 w-5 mx-auto text-neutral-400 mb-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-sm text-neutral-500">Generating script...</p>
                        <p className="text-xs text-neutral-400 mt-1">This may take 30-60 seconds</p>
                    </div>
                )}

                {script.status === 'failed' && (
                    <p className="text-sm text-red-600">{script.error || 'An error occurred'}</p>
                )}

                {script.status === 'completed' && (
                    <div className="space-y-4">
                        {/* Audio Player or Generate Button */}
                        {script.audioUrl ? (
                            <AudioPlayer src={script.audioUrl} />
                        ) : (
                            <button
                                onClick={generateAudio}
                                disabled={generatingAudio}
                                className="w-full h-10 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:bg-neutral-100 disabled:text-neutral-400 transition-colors flex items-center justify-center gap-2"
                            >
                                {generatingAudio ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating Audio...
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

                        {/* Script Text */}
                        {script.script && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-neutral-500">Script</p>
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed max-h-80 overflow-y-auto bg-neutral-50 rounded-lg p-4">
                                    {script.script}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
