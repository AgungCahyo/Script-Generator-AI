'use client'

import { useState, useEffect, useCallback } from 'react'
import ScriptForm from '@/components/ScriptForm'
import ScriptResult from '@/components/ScriptResult'
import HistoryList from '@/components/HistoryList'
import ScriptModal from '@/components/ScriptModal'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [modalScript, setModalScript] = useState<Script | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)

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
        if (modalScript?.id === scriptId) {
          setModalScript(data.script)
        }
        if (data.script.status === 'completed' || data.script.status === 'failed') {
          setPolling(false)
          setLoading(false)
          fetchScripts()
        }
      }
    } catch (error) {
      console.error('Error polling script:', error)
    }
  }, [fetchScripts, modalScript?.id])

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
        const newScript = {
          id: data.scriptId,
          topic,
          script: null,
          audioUrl: null,
          status: 'processing',
          error: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setCurrentScript(newScript)
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
      if (modalScript?.id === id) {
        setModalOpen(false)
        setModalScript(null)
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const handleRefresh = () => {
    if (currentScript?.id) pollScriptStatus(currentScript.id)
    fetchScripts()
  }

  const openModal = (script: Script) => {
    setModalScript(script)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalScript(null)
  }

  const handleScriptUpdated = (updatedScript: Script) => {
    setModalScript(updatedScript)
    if (currentScript?.id === updatedScript.id) {
      setCurrentScript(updatedScript)
    }
    fetchScripts()
  }

  const handleGenerateAudio = async () => {
    if (!modalScript) return
    setGeneratingAudio(true)

    try {
      const res = await fetch(`/api/scripts/${modalScript.id}/generate-audio`, { method: 'POST' })
      const data = await res.json()

      if (!data.success) {
        alert(data.error || 'Failed to start audio generation')
        setGeneratingAudio(false)
        return
      }

      const pollAudio = setInterval(async () => {
        const scriptRes = await fetch(`/api/scripts/${modalScript.id}`)
        const scriptData = await scriptRes.json()
        if (scriptData.script?.audioUrl) {
          clearInterval(pollAudio)
          setGeneratingAudio(false)
          setModalScript(scriptData.script)
          fetchScripts()
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
            <ScriptResult
              script={currentScript}
              onRefresh={handleRefresh}
              onViewDetail={() => openModal(currentScript)}
            />
          </section>
        )}

        <section>
          <h2 className="text-sm text-neutral-600 mb-3">History</h2>
          <HistoryList
            scripts={scripts}
            onSelect={openModal}
            onDelete={handleDelete}
          />
        </section>
      </div>

      <ScriptModal
        script={modalScript}
        isOpen={modalOpen}
        onClose={closeModal}
        onGenerateAudio={handleGenerateAudio}
        generatingAudio={generatingAudio}
        onScriptUpdated={handleScriptUpdated}
      />
    </main>
  )
}
