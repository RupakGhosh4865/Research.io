"use client"
import { useState, useEffect } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import api from '../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login, user } = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (user) router.push('/dashboard')
    }, [user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        console.log("Attempting login for:", email)
        console.log("API Base URL:", api.defaults.baseURL)

        try {
            const res = await api.post('/auth/login', { email, password })
            console.log("Login success, received token.")
            login(res.data.access_token, res.data.user)
            router.push('/dashboard')
        } catch (err: any) {
            console.error("Login Error:", err)
            const detail = err.response?.data?.detail
            if (typeof detail === 'string') {
                setError(detail)
            } else if (err.code === 'ERR_NETWORK') {
                setError("Network error: Cannot reach the backend. Please ensure the server is running.")
            } else {
                setError('Login failed. Please check your credentials.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6 relative overflow-hidden selection:bg-brand-primary selection:text-black">
            {/* Background elements */}
            <div className="fixed inset-0 bg-grid opacity-20 -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] -z-10"></div>

            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-10">
                    <Link href="/" className="font-syne text-3xl font-bold flex items-center justify-center gap-2 mb-4">
                        <span className="text-brand-primary">Deep</span>Research
                    </Link>
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-gray-500 mt-2">Enter your email and password to access your account.</p>
                </div>

                <div className="glass-card">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-gray-400">Password</label>
                                <a href="#" className="text-xs text-brand-primary hover:underline">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Authenticating...
                                </>
                            ) : (
                                <>
                                    Log In <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#ffffff10]"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0b0f1a] px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.location.href = `${api.defaults.baseURL}/auth/google/login`}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account? <Link href="/signup" className="text-brand-primary font-bold hover:underline">Sign up for free</Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                    Your data is secure and encrypted
                </p>
            </div>
        </div>
    )
}
