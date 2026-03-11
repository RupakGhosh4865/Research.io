"use client"
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext } from '@/context/AuthContext'
import api from '@/lib/api'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuthContext()

    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            const fetchUser = async () => {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                    const res = await api.get('/users/me')
                    login(token, res.data)
                    router.push('/dashboard')
                } catch (err) {
                    console.error("Failed to fetch user after Google login", err)
                    router.push('/login?error=google_failed')
                }
            }
            fetchUser()
        } else {
            router.push('/login')
        }
    }, [searchParams, login, router])

    return (
        <div className="min-h-screen bg-[#080B14] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d4ff] mx-auto mb-4"></div>
                <p className="text-gray-400">Authenticating with Google...</p>
            </div>
        </div>
    )
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    )
}
