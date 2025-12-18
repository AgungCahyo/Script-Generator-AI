'use client'

import { useState, useEffect, useCallback } from 'react'
import ScriptForm from '@/components/ScriptForm'
import ScriptResult from '@/components/ScriptResult'
import HistoryList from '@/components/HistoryList'

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
  const [loading, setLoading] = useState(false)
  const [currentScript, setCurrentScript] = useState<Script | null>(null)
  const [scripts, setScripts] = useState<Script[]>([])
  const [polling, setPolling] = useState(false)

  const fetchScripts = useCallback(async () => {
    try {
      const res = await fetch('/api/scripts')
      const data = await res.json()
      if (data.scripts) setScripts(data.scripts)
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
      interval = setInterval(() => pollScriptStatus(currentScript.id), 3000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [polling, currentScript?.id, pollScriptStatus])

  const handleSubmit = async (topic: string) => {
    setLoading(true)
    setCurrentScript(null)

    try {
      const res = await fetch('/api/scripts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const data = await res.json()

      if (data.success && data.scriptId) {
        setCurrentScript({
          id: data.scriptId,
          topic,
          script: null,
          audioUrl: null,
          status: 'processing',
          error: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        setPolling(true)
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
      if (currentScript?.id === id) setCurrentScript(null)
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const handleRefresh = () => {
    if (currentScript?.id) {
      pollScriptStatus(currentScript.id)
    }
    fetchScripts()
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-sm font-medium text-neutral-900">Script Generator</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-12">
        <section>
          <ScriptForm onSubmit={handleSubmit} loading={loading} />
        </section>

        {currentScript && (
          <section>
            <h2 className="text-sm text-neutral-600 mb-3">Result</h2>
            <ScriptResult script={currentScript} onRefresh={handleRefresh} />
          </section>
        )}

        <section>
          <h2 className="text-sm text-neutral-600 mb-3">History</h2>
          <HistoryList
            scripts={scripts}
            onSelect={setCurrentScript}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </main>
  )
}
