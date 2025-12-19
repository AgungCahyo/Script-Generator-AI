'use client'

import { useState } from 'react'
import AudioPlayer from './AudioPlayer'
import { VolumeHighOutline, Reload, DocumentTextOutline } from 'react-ionicons'

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
    onViewDetail: () => void
}

export default function ScriptResult({ script, onRefresh, onViewDetail }: ScriptResultProps) {
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
            const pollAudio = setInterval(async () => {
                const scriptRes = await fetch(`/api/scripts/${script.id}`)
                const scriptData = await scriptRes.json()
                if (scriptData.script?.audioUrl) {
                    clearInterval(pollAudio)
                    setGeneratingAudio(false)
                    onRefresh()
                }
            }, 3000)
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
                    <div className="space-y-4">
                        {script.script ? (
                            <div>
                                <p className="text-xs text-neutral-500 mb-2">Generating script...</p>
                                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed bg-neutral-50 rounded-lg p-4 relative">
                                    {script.script}
                                    <span className="inline-block w-2 h-4 bg-neutral-900 ml-1 animate-pulse" />
                                </pre>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="mb-3 flex justify-center">
                                    <Reload color="#a3a3a3" width="20px" height="20px" cssClasses="animate-spin" />
                                </div>
                                <p className="text-sm text-neutral-500">Starting generation...</p>
                                <p className="text-xs text-neutral-400 mt-1">Text will appear in a moment</p>
                            </div>
                        )}
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
                                        <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                                        Generating Audio...
                                    </>
                                ) : (
                                    <>
                                        <VolumeHighOutline color="currentColor" width="16px" height="16px" />
                                        Generate Audio
                                    </>
                                )}
                            </button>
                        )}

                        {/* Script Preview */}
                        {script.script && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-neutral-500">Script Preview</p>
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                                    >
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto bg-neutral-50 rounded-lg p-4">
                                    {script.script.slice(0, 500)}{script.script.length > 500 ? '...' : ''}
                                </pre>
                            </div>
                        )}

                        {/* View Detail Button */}
                        <button
                            onClick={onViewDetail}
                            className="w-full h-10 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <DocumentTextOutline color="currentColor" width="16px" height="16px" />
                            View Full Script
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
