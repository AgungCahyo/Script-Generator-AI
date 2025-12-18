'use client'

import { useState, useEffect } from 'react'
import AudioPlayer from './AudioPlayer'
import {
    DocumentTextOutline,
    CloseOutline,
    CopyOutline,
    CheckmarkOutline,
    VolumeHighOutline,
    Reload,
    CreateOutline,
    SaveOutline,
    CloseCircleOutline
} from 'react-ionicons'

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
    onScriptUpdated: (script: Script) => void
}

export default function ScriptModal({
    script,
    isOpen,
    onClose,
    onGenerateAudio,
    generatingAudio,
    onScriptUpdated
}: ScriptModalProps) {
    const [copied, setCopied] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedScript, setEditedScript] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (script?.script) {
            setEditedScript(script.script)
        }
    }, [script?.script])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isEditing) {
                    setIsEditing(false)
                    setEditedScript(script?.script || '')
                } else {
                    onClose()
                }
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose, isEditing, script?.script])

    if (!isOpen || !script) return null

    const copyToClipboard = () => {
        const textToCopy = isEditing ? editedScript : script.script
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy)
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

    const handleEdit = () => {
        setIsEditing(true)
        setEditedScript(script.script || '')
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedScript(script.script || '')
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/scripts/${script.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script: editedScript }),
            })
            const data = await res.json()
            if (data.success && data.script) {
                onScriptUpdated(data.script)
                setIsEditing(false)
            } else {
                alert(data.error || 'Failed to save script')
            }
        } catch (error) {
            console.error('Error saving script:', error)
            alert('Failed to save script')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => !isEditing && onClose()}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col bg-neutral-100 rounded-lg shadow-2xl overflow-hidden">
                {/* Toolbar */}
                <div className="flex-shrink-0 bg-white border-b border-neutral-200">
                    {/* Title bar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <DocumentTextOutline color="#000000" width="20px" height="20px" />
                            <span className="text-sm font-medium text-neutral-700 truncate max-w-md">
                                {script.topic}
                            </span>
                            {isEditing && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Editing</span>
                            )}
                        </div>
                        <button
                            onClick={() => isEditing ? handleCancelEdit() : onClose()}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        >
                            <CloseOutline color="currentColor" width="20px" height="20px" />
                        </button>
                    </div>

                    {/* Toolbar buttons */}
                    <div className="flex items-center gap-1 px-3 py-1.5">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-neutral-900 hover:bg-neutral-800 rounded disabled:opacity-50 transition-colors"
                                >
                                    {saving ? (
                                        <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                                    ) : (
                                        <SaveOutline color="currentColor" width="16px" height="16px" />
                                    )}
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                                >
                                    <CloseCircleOutline color="currentColor" width="16px" height="16px" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEdit}
                                    disabled={!script.script}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 transition-colors"
                                >
                                    <CreateOutline color="currentColor" width="16px" height="16px" />
                                    Edit
                                </button>

                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                                >
                                    {copied ? (
                                        <CheckmarkOutline color="currentColor" width="16px" height="16px" />
                                    ) : (
                                        <CopyOutline color="currentColor" width="16px" height="16px" />
                                    )}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>

                                <div className="w-px h-4 bg-neutral-200 mx-1" />

                                {script.audioUrl ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-600">
                                        <CheckmarkOutline color="currentColor" width="16px" height="16px" />
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
                                                <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <VolumeHighOutline color="currentColor" width="16px" height="16px" />
                                                Generate Audio
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Document area */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-3xl mx-auto bg-white rounded shadow-sm border border-neutral-200 min-h-full">
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
                            {script.audioUrl && !isEditing && (
                                <div className="mb-6">
                                    <AudioPlayer src={script.audioUrl} />
                                </div>
                            )}

                            {/* Script Content */}
                            {isEditing ? (
                                <textarea
                                    value={editedScript}
                                    onChange={(e) => setEditedScript(e.target.value)}
                                    className="w-full min-h-[400px] text-sm leading-7 text-neutral-700 font-mono p-4 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-y"
                                    placeholder="Enter script content..."
                                />
                            ) : script.script ? (
                                <div className="prose prose-neutral max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-neutral-700 p-0 m-0 bg-transparent border-0">
                                        {script.script}
                                    </pre>
                                </div>
                            ) : script.status === 'processing' ? (
                                <div className="py-16 text-center">
                                    <div className="mb-3 flex justify-center">
                                        <Reload color="#a3a3a3" width="24px" height="24px" cssClasses="animate-spin" />
                                    </div>
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
                                Script Generator • {isEditing ? 'Edit Mode' : 'Page 1 of 1'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status bar */}
                <div className="flex-shrink-0 bg-black px-4 py-1 flex items-center justify-between text-xs text-white">
                    <span>
                        {isEditing
                            ? `${editedScript.length.toLocaleString()} characters`
                            : script.script
                                ? `${script.script.length.toLocaleString()} characters`
                                : 'No content'
                        }
                    </span>
                    <span className="capitalize">{isEditing ? 'editing' : script.status}</span>
                </div>
            </div>
        </div>
    )
}
