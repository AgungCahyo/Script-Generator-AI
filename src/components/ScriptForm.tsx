'use client'

import { useState } from 'react'
import { Reload } from 'react-ionicons'

interface ScriptFormProps {
    onSubmit: (topic: string) => Promise<void>
    loading: boolean
    disabled?: boolean
}

export default function ScriptForm({ onSubmit, loading, disabled = false }: ScriptFormProps) {
    const [topic, setTopic] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic.trim() || loading || disabled) return
        await onSubmit(topic.trim())
        setTopic('')
    }

    const isDisabled = loading || disabled

    return (
        <form onSubmit={handleSubmit}>
            <label className="block text-sm text-neutral-600 mb-2">Topic</label>
            <div className="flex gap-3">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={disabled ? "Sign in to generate scripts..." : "Enter your video topic..."}
                    className={`flex-1 h-10 px-3 text-sm border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow ${disabled ? 'bg-neutral-50 cursor-not-allowed' : ''}`}
                    disabled={isDisabled}
                />
                <button
                    type="submit"
                    disabled={isDisabled || !topic.trim()}
                    className="h-10 px-4 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Reload color="currentColor" width="16px" height="16px" cssClasses="animate-spin" />
                            Generating
                        </span>
                    ) : (
                        'Generate'
                    )}
                </button>
            </div>
        </form>
    )
}
