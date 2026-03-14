"use client"
import { useState, useEffect } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import api from '../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react'

export default function SignupPage() {
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
        console.log("Attempting signup for:", email)
        console.log("API Base URL:", api.defaults.baseURL)

        try {
            const res = await api.post('/auth/signup', { email, password })
            console.log("Signup success, received token.")
            login(res.data.access_token, res.data.user)
            router.push('/dashboard')
        } catch (err: any) {
            console.error("Signup Error:", err)
            const detail = err.response?.data?.detail
            if (typeof detail === 'string') {
                setError(detail)
            } else if (err.code === 'ERR_NETWORK') {
                setError("Network error: Cannot reach the backend. Please ensure the server is running.")
            } else {
                setError('Signup failed. Please try again or use a different email.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6 relative overflow-hidden selection:bg-brand-primary selection:text-black">
            {/* Background elements */}
            <div className="fixed inset-0 bg-grid opacity-20 -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-[120px] -z-10"></div>

            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-10">
                    <Link href="/" className="font-syne text-3xl font-bold flex items-center justify-center gap-2 mb-4 text-white hover:text-brand-primary transition-colors">
                        <span className="text-brand-primary">Deep</span>Research
                    </Link>
                    <h2 className="text-2xl font-bold">Create Account</h2>
                    <p className="text-gray-500 mt-2">Start your first research paper in seconds.</p>
                </div>

                <div className="glass-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 bg-brand-primary/10 rounded-bl-2xl border-l border-b border-brand-primary/20">
                        <Sparkles size={16} className="text-brand-primary animate-pulse" />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 ml-1">Choose Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="input-field pl-12"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Creating account...
                                </>
                            ) : (
                                <>
                                    Sign Up <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
                            5 Free research credits on signup
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
                            Access to llama-3.3-70b-versatile
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-brand-primary font-bold hover:underline">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
