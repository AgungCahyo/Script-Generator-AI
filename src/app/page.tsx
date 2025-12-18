'use client'

import { useState, useEffect, useCallback } from 'react'

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

export default function Home() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentScript, setCurrentScript] = useState<Script | null>(null)
  const [scripts, setScripts] = useState<Script[]>([])
  const [polling, setPolling] = useState(false)

  const fetchScripts = useCallback(async () => {
    try {
      const res = await fetch('/api/scripts')
      const data = await res.json()
      if (data.scripts) {
        setScripts(data.scripts)
      }
    } catch (error) {
      console.error('Error fetching scripts:', error)
    }
  }, [])

  const pollScriptStatus = useCallback(async (scriptId: string) => {
    try {
      const res = await fetch(`/api/scripts/${scriptId}`)
      const data = await res.json()
      if (data.script) {
        setCurrentScript(data.script)
        if (data.script.status === 'completed' || data.script.status === 'failed') {
          setPolling(false)
          setLoading(false)
          fetchScripts()
        }
      }
    } catch (error) {
      console.error('Error polling script:', error)
    }
  }, [fetchScripts])

  useEffect(() => {
    fetchScripts()
  }, [fetchScripts])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (polling && currentScript?.id) {
      interval = setInterval(() => {
        pollScriptStatus(currentScript.id)
      }, 3000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [polling, currentScript?.id, pollScriptStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || loading) return

    setLoading(true)
    setCurrentScript(null)

    try {
      const res = await fetch('/api/scripts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })
      const data = await res.json()

      if (data.success && data.scriptId) {
        setCurrentScript({
          id: data.scriptId,
          topic: topic.trim(),
          script: null,
          audioUrl: null,
          status: 'processing',
          error: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        setPolling(true)
        setTopic('')
      } else {
        alert(data.error || 'Failed to trigger script generation')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to connect to server')
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus script ini?')) return
    try {
      await fetch(`/api/scripts/${id}`, { method: 'DELETE' })
      fetchScripts()
      if (currentScript?.id === id) {
        setCurrentScript(null)
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium'
    switch (status) {
      case 'completed':
        return `${baseClass} bg-green-100 text-green-800`
      case 'processing':
        return `${baseClass} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClass} bg-red-100 text-red-800`
      default:
        return `${baseClass} bg-gray-100 text-gray-800`
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Script Generator
          </h1>
          <p className="text-gray-500 text-sm">
            Generate naskah video YouTube dengan AI
          </p>
        </header>

        {/* Input Form */}
        <section className="mb-8">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topik Konten
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Cara mengatasi prokrastinasi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="mt-4 w-full py-2.5 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Script'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Current Script Result */}
        {currentScript && (
          <section className="mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-medium text-gray-900">
                    {currentScript.topic}
                  </h2>
                </div>
                <span className={getStatusBadge(currentScript.status)}>
                  {currentScript.status === 'processing' ? 'Processing' :
                    currentScript.status === 'completed' ? 'Completed' :
                      'Failed'}
                </span>
              </div>

              {currentScript.status === 'processing' && (
                <div className="py-8 text-center">
                  <svg className="animate-spin h-6 w-6 mx-auto text-blue-600 mb-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-gray-600 text-sm">AI sedang membuat naskah...</p>
                  <p className="text-gray-400 text-xs mt-1">Proses ini membutuhkan waktu 30-60 detik</p>
                </div>
              )}

              {currentScript.status === 'failed' && currentScript.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
                  {currentScript.error}
                </div>
              )}

              {currentScript.status === 'completed' && currentScript.script && (
                <div>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => copyToClipboard(currentScript.script || '')}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    >
                      Copy Script
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-80 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-mono">
                      {currentScript.script}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* History */}
        <section>
          <h2 className="text-base font-medium text-gray-900 mb-4">
            Riwayat
          </h2>

          {scripts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Belum ada script yang dibuat
            </div>
          ) : (
            <div className="space-y-2">
              {scripts.map((script) => (
                <div
                  key={script.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => setCurrentScript(script)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {script.topic}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(script.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={getStatusBadge(script.status)}>
                        {script.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(script.id)
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
