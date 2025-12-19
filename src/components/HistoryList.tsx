'use client'

import { VolumeHighOutline, TrashOutline } from 'react-ionicons'

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

interface HistoryListProps {
    scripts: Script[]
    onSelect: (script: Script) => void
    onDelete: (id: string) => void
    loading?: boolean
}

export default function HistoryList({ scripts, onSelect, onDelete, loading = false }: HistoryListProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusBadge = (status: string) => {
        const base = 'text-xs px-2 py-0.5 rounded-full'
        switch (status) {
            case 'completed':
                return `${base} bg-green-50 text-green-700`
            case 'processing':
                return `${base} bg-amber-50 text-amber-700`
            default:
                return `${base} bg-red-50 text-red-700`
        }
    }

    if (loading && scripts.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-neutral-200 border-t-neutral-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-neutral-400">Loading history...</p>
                </div>
            </div>
        )
    }

    if (scripts.length === 0) {
        return (
            <p className="text-sm text-neutral-400 py-8 text-center">
                No scripts generated yet
            </p>
        )
    }

    return (
        <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
            {scripts.map((script) => (
                <div
                    key={script.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors"
                    onClick={() => onSelect(script)}
                >
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-neutral-900 truncate">{script.topic}</p>
                            {script.audioUrl && (
                                <VolumeHighOutline color="#a3a3a3" width="14px" height="14px" />
                            )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">{formatDate(script.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={getStatusBadge(script.status)}>{script.status}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(script.id)
                            }}
                            className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                        >
                            <TrashOutline color="currentColor" width="16px" height="16px" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
