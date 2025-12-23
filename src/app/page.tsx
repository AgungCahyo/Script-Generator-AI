'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ScriptForm from '@/components/ScriptForm'
import HistoryList from '@/components/HistoryList'
import ScriptModal from '@/components/ScriptModal'
import LoginModal from '@/components/LoginModal'
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/Confirm'
import { LogOutOutline, PersonCircleOutline, LogInOutline, PersonOutline, CardOutline, ChevronDownOutline } from 'react-ionicons'
import CreditBalance from '@/components/CreditBalance'
import { Script } from '@/lib/types/script'
import { ScriptFormData } from '@/lib/types/form'
import Link from 'next/link'

export default function Home() {
  const { user, loading: authLoading, signOut, getIdToken } = useAuth()
  const { showError } = useToast()
  const { confirm } = useConfirm()
  const [loading, setLoading] = useState(false)
  const [currentScript, setCurrentScript] = useState<Script | null>(null)
  const [scripts, setScripts] = useState<Script[]>([])
  const [fetchingHistory, setFetchingHistory] = useState(false)
  const [polling, setPolling] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalScript, setModalScript] = useState<Script | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [authToken, setAuthToken] = useState<string | undefined>(undefined)
  const [insufficientCreditsModalOpen, setInsufficientCreditsModalOpen] = useState(false)
  const [creditInfo, setCreditInfo] = useState<{ required: number; available: number }>({ required: 0, available: 0 })
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileDropdownOpen])

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
        // Try to parse error from JSON response
        try {
          const errorData = await res.json()

          // Handle 402 Payment Required with modal
          if (res.status === 402) {
            setCreditInfo({
              required: errorData.required || 0,
              available: errorData.available || 0
            })
            setInsufficientCreditsModalOpen(true)
          } else {
            showError(errorData.error || 'Failed to start script generation')
          }
        } catch {
          showError('Failed to start script generation')
        }
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
        audioFiles: null,
        imageUrls: null,
        status: 'pending',
        error: null,
        firstViewedAt: null,
        userId: user?.uid || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setCurrentScript(newScript)

      // Auto-open modal to show typing animation
      setModalScript(newScript)
      setModalOpen(true)
      setAuthToken(token || undefined)

      // Read stream
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        showError('Failed to read stream')
        setLoading(false)
        return
      }

      let accumulatedText = ''
      let displayedText = ''
      let updateInterval: NodeJS.Timeout | null = null
      let hasError = false

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

            // Update modal script in real-time
            setModalScript(prev => prev ? {
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
          // Check if there's an error in the accumulated text
          if (accumulatedText.includes('ERROR:')) {
            const errorMatch = accumulatedText.match(/ERROR:\s*(\{.*\})/)
            if (errorMatch) {
              try {
                const errorData = JSON.parse(errorMatch[1])
                showError(errorData.error || 'Failed to generate script')
                setCurrentScript(prev => prev ? {
                  ...prev,
                  status: 'failed',
                  error: errorData.error
                } : null)
                setModalScript(prev => prev ? {
                  ...prev,
                  status: 'failed',
                  error: errorData.error
                } : null)
                hasError = true
              } catch {
                showError('Failed to generate script')
              }
            }
            // Remove error marker from text
            accumulatedText = accumulatedText.replace(/\n\nERROR:.*$/, '')
          }

          if (!hasError) {
            // Make sure all text is displayed
            displayedText = accumulatedText
            setCurrentScript(prev => prev ? { ...prev, script: accumulatedText, status: 'completed' } : null)
            setModalScript(prev => prev ? { ...prev, script: accumulatedText, status: 'completed' } : null)
          }

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
      showError('Network error. Please check your connection and try again')
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Hapus Script?',
      message: 'Script bakal dihapus permanen dan ga bisa dikembaliin lho.',
      confirmText: 'Hapus',
      cancelText: 'Gajadi',
      variant: 'danger'
    })
    if (!confirmed) return
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
    }
  }

  const handleRefresh = () => {
    if (currentScript?.id) pollScriptStatus(currentScript.id)
    fetchScripts()
  }

  const openModal = async (script: Script) => {
    setModalScript(script)
    setModalOpen(true)
    if (user) {
      const token = await getIdToken()
      setAuthToken(token || undefined)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalScript(null)
    setAuthToken(undefined)
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

      if (!res.ok || !data.success) {
        showError(data.error || 'Failed to start audio generation')
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
      showError('Network error. Please check your connection and try again')
      setGeneratingAudio(false)
    }
  }

  const handleRetry = async (scriptId: string) => {
    const scriptToRetry = scripts.find(s => s.id === scriptId)
    if (!scriptToRetry) return

    // Close modal
    closeModal()

    // Delete the failed script
    try {
      const token = await getIdToken()
      await fetch(`/api/scripts/${scriptId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
    }

    // Refresh scripts list
    fetchScripts()

    // Re-submit with same topic (user can modify if needed)
    // For now, just scroll to form - user will manually retry
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
                <CreditBalance onTopUpClick={() => window.location.href = '/pricing'} />

                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1 p-1.5 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                    title="Account menu"
                  >
                    <PersonCircleOutline color="currentColor" width="24px" height="24px" />
                    <ChevronDownOutline color="currentColor" width="14px" height="14px" cssClasses={`transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                        <div className="flex items-center gap-2 mb-1">
                          <PersonOutline color="#737373" width="16px" height="16px" />
                          <span className="text-xs font-medium text-neutral-900">Account</span>
                        </div>
                        <p className="text-xs text-neutral-600 truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/dashboard/billing"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <CardOutline color="currentColor" width="16px" height="16px" />
                          <span>Billing & Credits</span>
                        </Link>

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            signOut()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOutOutline color="currentColor" width="16px" height="16px" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
        onRetry={handleRetry}
        authToken={authToken}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <InsufficientCreditsModal
        isOpen={insufficientCreditsModalOpen}
        onClose={() => setInsufficientCreditsModalOpen(false)}
        required={creditInfo.required}
        available={creditInfo.available}
      />
    </main>
  )
}
