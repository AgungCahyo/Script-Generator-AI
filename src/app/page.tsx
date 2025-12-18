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
    if (!confirm('Delete this script?')) return
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
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-sm font-medium text-neutral-900">
            Script Generator
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Input Section */}
        <section className="mb-12">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm text-neutral-600 mb-2">
              Topic
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your video topic..."
                className="flex-1 h-10 px-3 text-sm border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="h-10 px-4 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating
                  </span>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Result Section */}
        {currentScript && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-neutral-600">Result</h2>
              {currentScript.status === 'completed' && (
                <button
                  onClick={() => copyToClipboard(currentScript.script || '')}
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Copy
                </button>
              )}
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                <span className="text-sm text-neutral-900">{currentScript.topic}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${currentScript.status === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : currentScript.status === 'processing'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                  {currentScript.status}
                </span>
              </div>

              <div className="p-4">
                {currentScript.status === 'processing' && (
                  <div className="py-12 text-center">
                    <svg className="animate-spin h-5 w-5 mx-auto text-neutral-400 mb-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm text-neutral-500">Generating script...</p>
                    <p className="text-xs text-neutral-400 mt-1">This may take 30-60 seconds</p>
                  </div>
                )}

                {currentScript.status === 'failed' && (
                  <p className="text-sm text-red-600">{currentScript.error || 'An error occurred'}</p>
                )}

                {currentScript.status === 'completed' && currentScript.script && (
                  <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                    {currentScript.script}
                  </pre>
                )}
              </div>
            </div>
          </section>
        )}

        {/* History Section */}
        <section>
          <h2 className="text-sm text-neutral-600 mb-3">History</h2>

          {scripts.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">
              No scripts generated yet
            </p>
          ) : (
            <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100">
              {scripts.map((script) => (
                <div
                  key={script.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => setCurrentScript(script)}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm text-neutral-900 truncate">{script.topic}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDate(script.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${script.status === 'completed'
                        ? 'bg-green-50 text-green-700'
                        : script.status === 'processing'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                      {script.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(script.id)
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
          )}
        </section>
      </div>
    </main>
  )
}
