'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LogoGoogle, MailOutline, LockClosedOutline, PersonOutline, Reload } from 'react-ionicons'

export default function LoginForm() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

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
            const error = err as { message?: string }
            setError(error.message || 'Authentication failed')
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
            const error = err as { message?: string }
            setError(error.message || 'Google sign-in failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Script Generator</h1>
                    <p className="text-sm text-neutral-500">
                        {isSignUp ? 'Create an account' : 'Sign in to continue'}
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
                    className="w-full h-11 flex items-center justify-center gap-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors mb-4"
                >
                    <LogoGoogle color="#4285F4" width="20px" height="20px" />
                    <span className="text-sm font-medium text-neutral-700">Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-neutral-200" />
                    <span className="text-xs text-neutral-400">or</span>
                    <div className="flex-1 h-px bg-neutral-200" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
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
                <p className="text-center text-sm text-neutral-500 mt-6">
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
