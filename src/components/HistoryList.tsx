'use client'

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
}

export default function HistoryList({ scripts, onSelect, onDelete }: HistoryListProps) {
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
                                <svg className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
