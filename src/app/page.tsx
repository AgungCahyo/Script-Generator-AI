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
import Head from 'next/head'
import Footer from '@/components/Footer'
import LoadingScreen from '@/components/LoadingScreen'
import { useRouter } from 'next/navigation'

// JSON-LD Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ScriptAI",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "IDR",
    "lowPrice": "25000",
    "highPrice": "500000",
    "offerCount": "4"
  },
  "description": "Generator skrip video AI profesional menggunakan Gemini 3.0. Platform Indonesia pertama dengan sistem pay-per-use untuk kreator konten.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "100"
  },
  "inLanguage": ["id", "en"]
}

export default function Home() {
  const { user, loading: authLoading, signOut, getIdToken } = useAuth()
  const { showError } = useToast()
  const { confirm } = useConfirm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentScript, setCurrentScript] = useState<Script | null>(null)
  const [scripts, setScripts] = useState<Script[]>([])
  const [fetchingHistory, setFetchingHistory] = useState(false)
  const [polling, setPolling] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalScript, setModalScript] = useState<Script | null>(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [authToken, setAuthToken] = useState<string | undefined>(undefined)
  const [insufficientCreditsModalOpen, setInsufficientCreditsModalOpen] = useState(false)
  const [creditInfo, setCreditInfo] = useState<{ required: number; available: number }>({ required: 0, available: 0 })
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // Reset login loading when modal closes or user logs in
  useEffect(() => {
    if (!loginModalOpen || user) {
      setLoginLoading(false)
    }
  }, [loginModalOpen, user])

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
      setHistoryLoaded(true)
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
        keywords: null,
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

  // Show loading while checking auth, navigating, or logging out (FULL SCREEN REPLACEMENT)
  if (authLoading || logoutLoading || navigating) {
    return <LoadingScreen message={logoutLoading ? 'Signing out...' : navigating ? 'Loading...' : 'Loading...'} />
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-white">
        <header className="border-b border-neutral-200">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-sm font-medium text-neutral-900">Script Generator</h1>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <CreditBalance onTopUpClick={() => {
                    setNavigating(true)
                    router.push('/pricing')
                  }} />

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
                            onClick={async () => {
                              setProfileDropdownOpen(false)
                              setLogoutLoading(true)
                              // Add delay to ensure loading screen is visible
                              await new Promise(resolve => setTimeout(resolve, 800))
                              try {
                                await signOut()
                              } finally {
                                setLogoutLoading(false)
                              }
                            }}
                            disabled={logoutLoading}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {logoutLoading ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Signing out...</span>
                              </>
                            ) : (
                              <>
                                <LogOutOutline color="currentColor" width="16px" height="16px" />
                                <span>Sign Out</span>
                              </>
                            )}
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

        {/* Conditional Content Based on User Status */}
        {!user ? (
          // WELCOME PAGE - For Logged Out Users
          <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
            {/* Hero Section */}
            <section className="text-center py-16">
              <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
                Generate Script Video AI dalam Hitungan Detik
              </h1>
              <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
                Buat script profesional untuk YouTube Shorts, TikTok, dan Instagram Reels dengan teknologi AI
              </p>

              {/* Key Benefits */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Hemat 90% waktu</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Optimized untuk virality</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>100% Bahasa Indonesia</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Mulai Gratis - 60 Credits
                </button>
                <Link
                  href="/showcase"
                  className="px-8 py-3 border border-neutral-300 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Lihat Contoh Script
                </Link>
              </div>
            </section>

            {/* How It Works */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-12">
                Cara Kerjanya
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-14 h-14 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Masukkan Topik
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Ceritakan ide konten kamu, pilih platform dan durasi video
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-14 h-14 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    AI Generate
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Gemini AI bikin script lengkap dengan visual dan narasi per section
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-14 h-14 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Edit & Export
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Customize, tambah voice-over dengan TTS, download dan create!
                  </p>
                </div>
              </div>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-12">
                Fitur Lengkap ScriptAI
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">
                    AI-Powered
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Gemini 3.0 Flash
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">
                    TTS Voice
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Voice-over professional
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">
                    Media Search
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Stock images & videos
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">
                    Pay-per-Use
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Mulai dari 25rb
                  </p>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="text-center py-12 bg-neutral-50 rounded-2xl">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
                Siap Mulai?
              </h2>
              <p className="text-neutral-600 mb-6">
                Dapatkan 60 credits gratis untuk new users
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Daftar Sekarang
              </button>
            </section>
          </div>
        ) : (
          // SIMPLE INTERFACE - For Logged In Users
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-12">
            <section id="script-form">
              <ScriptForm
                onSubmit={handleSubmit}
                loading={loading}
                disabled={!user}
                autoExpand={historyLoaded && scripts.length === 0}
              />
            </section>

            <section>
              <h2 className="text-sm text-neutral-600 mb-3">History</h2>
              <HistoryList
                scripts={scripts}
                onSelect={openModal}
                onDelete={handleDelete}
                loading={fetchingHistory}
              />
            </section>
          </div>
        )}

        <ScriptModal
          script={modalScript}
          isOpen={modalOpen}
          onClose={closeModal}
          onScriptUpdated={handleScriptUpdated}
          onRetry={handleRetry}
          authToken={authToken}
        />

        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoadingChange={setLoginLoading}
        />

        {/* Login Loading Overlay */}
        {loginLoading && (
          <div className="fixed inset-0 z-[60] bg-white">
            <LoadingScreen message="Signing in..." />
          </div>
        )}

        <InsufficientCreditsModal
          isOpen={insufficientCreditsModalOpen}
          onClose={() => setInsufficientCreditsModalOpen(false)}
          required={creditInfo.required}
          available={creditInfo.available}
        />
      </main>
      <Footer />
    </>
  )
}
