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

  // Fetch scripts history
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

  // Poll for current script status
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

  // Initial load
  useEffect(() => {
    fetchScripts()
  }, [fetchScripts])

  // Polling effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (polling && currentScript?.id) {
      interval = setInterval(() => {
        pollScriptStatus(currentScript.id)
      }, 3000) // Poll every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [polling, currentScript?.id, pollScriptStatus])

  // Handle form submission
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
        // Start polling
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

  // Handle delete script
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

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🎬 Script Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Generate naskah video YouTube dengan AI
          </p>
        </header>

        {/* Input Form */}
        <section className="mb-12">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl">
              <label className="block text-white/80 font-medium mb-3">
                Topik Konten
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Cara mengatasi prokrastinasi"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full mt-4 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '✨ Generate Script'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Current Script Result */}
        {currentScript && (
          <section className="mb-12">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  📝 {currentScript.topic}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(currentScript.status)}`}>
                  {currentScript.status === 'processing' ? '⏳ Processing...' :
                    currentScript.status === 'completed' ? '✅ Completed' :
                      '❌ Failed'}
                </span>
              </div>

              {currentScript.status === 'processing' && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-purple-400">
                    <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-lg">AI sedang membuat naskah...</span>
                  </div>
                  <p className="text-gray-500 mt-2">Proses ini membutuhkan waktu 30-60 detik</p>
                </div>
              )}

              {currentScript.status === 'failed' && currentScript.error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                  {currentScript.error}
                </div>
              )}

              {currentScript.status === 'completed' && currentScript.script && (
                <div>
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={() => copyToClipboard(currentScript.script || '')}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-colors"
                    >
                      📋 Copy Script
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-mono">
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
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            📚 Riwayat Script
          </h2>

          {scripts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Belum ada script yang dibuat
            </div>
          ) : (
            <div className="grid gap-4">
              {scripts.map((script) => (
                <div
                  key={script.id}
                  className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  onClick={() => setCurrentScript(script)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{script.topic}</h3>
                      <p className="text-gray-500 text-sm">{formatDate(script.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(script.status)}`}>
                        {script.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(script.id)
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        🗑️
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
