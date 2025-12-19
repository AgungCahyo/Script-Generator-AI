'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ScriptForm from '@/components/ScriptForm'
import ScriptResult from '@/components/ScriptResult'
import HistoryList from '@/components/HistoryList'
import ScriptModal from '@/components/ScriptModal'
import LoginModal from '@/components/LoginModal'
import { LogOutOutline, PersonCircleOutline, LogInOutline } from 'react-ionicons'
import { Script } from '@/lib/types/script'
import { ScriptFormData } from '@/lib/types/form'

export default function Home() {
  const { user, loading: authLoading, signOut, getIdToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentScript, setCurrentScript] = useState<Script | null>(null)
  const [scripts, setScripts] = useState<Script[]>([])
  const [fetchingHistory, setFetchingHistory] = useState(false)
  const [polling, setPolling] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalScript, setModalScript] = useState<Script | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const fetchScripts = useCallback(async () => {
    if (!user) return
    setFetchingHistory(true)
    try {
      const token = await getIdToken()
      const res = await fetch('/api/scripts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.scripts) setScripts(data.scripts)
    } catch (error) {
      console.error('Error fetching scripts:', error)
    } finally {
      setFetchingHistory(false)
    }
  }, [user, getIdToken])

  const pollScriptStatus = useCallback(async (scriptId: string) => {
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/scripts/${scriptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
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
  }, [fetchScripts, modalScript?.id, getIdToken])

  useEffect(() => {
    if (user) fetchScripts()
  }, [user, fetchScripts])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (polling && currentScript?.id) {
      interval = setInterval(() => pollScriptStatus(currentScript.id), 3000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [polling, currentScript?.id, pollScriptStatus])

  const handleSubmit = async (formData: ScriptFormData) => {
    setLoading(true)
    setCurrentScript(null)

    try {
      const token = await getIdToken()

      // Call streaming API
      const res = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        alert('Failed to start script generation')
        setLoading(false)
        return
      }

      // Get script ID from headers
      const scriptId = res.headers.get('X-Script-Id') || ''

      // Initialize script object
      const newScript: Script = {
        id: scriptId,
        topic: formData.topic,
        script: '',
        audioUrl: null,
        status: 'processing',
        error: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setCurrentScript(newScript)

      // Read stream
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        alert('Failed to read stream')
        setLoading(false)
        return
      }

      let accumulatedText = ''
      let displayedText = ''
      let updateInterval: NodeJS.Timeout | null = null

      // Update display gradually for natural typing effect
      const startTypingAnimation = () => {
        updateInterval = setInterval(() => {
          if (displayedText.length < accumulatedText.length) {
            // Add characters gradually (adjust speed here: lower = faster)
            const charsToAdd = Math.min(3, accumulatedText.length - displayedText.length)
            displayedText = accumulatedText.slice(0, displayedText.length + charsToAdd)

            setCurrentScript(prev => prev ? {
              ...prev,
              script: displayedText
            } : null)
          }
        }, 30) // Update every 30ms for smooth typing
      }

      startTypingAnimation()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Make sure all text is displayed
          displayedText = accumulatedText
          setCurrentScript(prev => prev ? { ...prev, script: accumulatedText, status: 'completed' } : null)

          if (updateInterval) clearInterval(updateInterval)
          setLoading(false)
          fetchScripts() // Refresh history
          break
        }

        // Decode chunk and append to accumulated text (buffer)
        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk
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
      const token = await getIdToken()
      await fetch(`/api/scripts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
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
      const token = await getIdToken()
      const res = await fetch(`/api/scripts/${modalScript.id}/generate-audio`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()

      if (!data.success) {
        alert(data.error || 'Failed to start audio generation')
        setGeneratingAudio(false)
        return
      }

      const pollAudio = setInterval(async () => {
        const scriptRes = await fetch(`/api/scripts/${modalScript.id}`, {
          headers: { Authorization: `Bearer ${await getIdToken()}` }
        })
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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-sm font-medium text-neutral-900">Script Generator</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <PersonCircleOutline color="#a3a3a3" width="20px" height="20px" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOutOutline color="currentColor" width="18px" height="18px" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <LogInOutline color="currentColor" width="16px" height="16px" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-12">
        <section>
          <ScriptForm
            onSubmit={handleSubmit}
            loading={loading}
            disabled={!user}
          />
        </section>

        {user && currentScript && (
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
          {user ? (
            <HistoryList
              scripts={scripts}
              onSelect={openModal}
              onDelete={handleDelete}
              loading={fetchingHistory}
            />
          ) : (
            <div className="text-center py-8 text-neutral-400 text-sm">
              Sign in to view your script history
            </div>
          )}
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

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </main>
  )
}
