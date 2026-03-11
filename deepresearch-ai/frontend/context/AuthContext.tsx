"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api, { setAuthToken } from '@/lib/api'

interface User {
    id: string
    email: string
    credits_remaining: number
    plan: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, userData: User) => void
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
            setAuthToken(storedToken)
        }
        setIsLoading(false)
    }, [])

    const login = (newToken: string, userData: User) => {
        setToken(newToken)
        setUser(userData)
        setAuthToken(newToken)
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}
