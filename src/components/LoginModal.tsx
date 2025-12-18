'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LogoGoogle, MailOutline, LockClosedOutline, PersonOutline, Reload, CloseOutline } from 'react-ionicons'

// Sanitize Firebase errors to user-friendly messages
function getAuthErrorMessage(error: unknown): string {
    const firebaseError = error as { code?: string; message?: string }

    const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'Email tidak valid.',
        'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
        'auth/user-not-found': 'Email tidak terdaftar.',
        'auth/wrong-password': 'Password salah.',
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/weak-password': 'Password terlalu lemah. Minimal 6 karakter.',
        'auth/operation-not-allowed': 'Metode login ini tidak diaktifkan.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
        'auth/network-request-failed': 'Koneksi internet bermasalah.',
        'auth/popup-closed-by-user': 'Login dibatalkan.',
        'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk melanjutkan.',
        'auth/cancelled-popup-request': 'Login dibatalkan.',
        'auth/unauthorized-domain': 'Domain tidak diizinkan untuk login.',
        'auth/invalid-api-key': 'Terjadi kesalahan konfigurasi. Hubungi admin.',
    }

    if (firebaseError.code && errorMessages[firebaseError.code]) {
        return errorMessages[firebaseError.code]
    }

    console.error('Auth error:', error)
    return 'Terjadi kesalahan. Silakan coba lagi.'
}

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth()
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Close modal when user logs in successfully
    useEffect(() => {
        if (user && isOpen) {
            onClose()
        }
    }, [user, isOpen, onClose])

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setEmail('')
            setPassword('')
            setError('')
            setIsSignUp(false)
        }
    }, [isOpen])

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password)
            } else {
                await signInWithEmail(email, password)
            }
        } catch (err: unknown) {
            setError(getAuthErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        setLoading(true)
        setError('')

        try {
            await signInWithGoogle()
        } catch (err: unknown) {
            setError(getAuthErrorMessage(err))
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                    <CloseOutline color="currentColor" width="20px" height="20px" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900 mb-1">
                        {isSignUp ? 'Create Account' : 'Sign In'}
                    </h2>
                    <p className="text-sm text-neutral-500">
                        {isSignUp ? 'Create an account to get started' : 'Sign in to generate scripts'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full h-11 flex items-center justify-center gap-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors mb-4 disabled:opacity-50"
                >
                    <LogoGoogle color="#4285F4" width="20px" height="20px" />
                    <span className="text-sm font-medium text-neutral-700">Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px bg-neutral-200" />
                    <span className="text-xs text-neutral-400">or</span>
                    <div className="flex-1 h-px bg-neutral-200" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <MailOutline color="#a3a3a3" width="18px" height="18px" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="w-full h-11 pl-10 pr-4 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <LockClosedOutline color="#a3a3a3" width="18px" height="18px" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            minLength={6}
                            className="w-full h-11 pl-10 pr-4 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 flex items-center justify-center gap-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors"
                    >
                        {loading ? (
                            <Reload color="currentColor" width="18px" height="18px" cssClasses="animate-spin" />
                        ) : (
                            <>
                                <PersonOutline color="currentColor" width="18px" height="18px" />
                                {isSignUp ? 'Sign Up' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle */}
                <p className="text-center text-sm text-neutral-500 mt-5">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-neutral-900 font-medium hover:underline"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    )
}
