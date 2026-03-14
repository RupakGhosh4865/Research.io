"use client"
import React, { useEffect, useState } from 'react'
import { Users, FileText, Zap, Crown, Mail, Calendar, ShieldCheck } from 'lucide-react'
import api from '../../../lib/api'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

interface AdminStats {
    total_users: number
    plans_breakdown: Record<string, number>
    total_papers: number
    total_credits_available: number
}

interface UserRecord {
    id: string
    email: string
    plan: string
    credits: number
    is_admin: boolean
    created_at: string
}

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuthContext()
    const router = useRouter()
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<UserRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && (!user || !user.is_admin)) {
            router.push('/dashboard')
        }
    }, [authLoading, user, router])

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/users')
                ])
                setStats(statsRes.data)
                setUsers(usersRes.data)
            } catch (err) {
                console.error("Failed to fetch admin data", err)
            } finally {
                setIsLoading(false)
            }
        }
        if (user?.is_admin) fetchAdminData()
    }, [user])

    if (isLoading || authLoading) return (
        <div className="p-8 flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-orbitron font-black text-white text-glow">ADMIN COMMAND</h1>
                    <p className="text-gray-400 mt-1">Platform-wide neural activity monitoring.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <ShieldCheck size={20} />
                    <span className="text-xs font-black tracking-widest uppercase">SUPERUSER ACCESS</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Agents" value={stats?.total_users || 0} color="blue" />
                <StatCard icon={FileText} label="Neural Reports" value={stats?.total_papers || 0} color="green" />
                <StatCard icon={Zap} label="System Credits" value={stats?.total_credits_available || 0} color="orange" />
                <StatCard icon={Crown} label="Pro Nodes" value={stats?.plans_breakdown?.pro || 0} color="purple" />
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Users List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-6 rounded-2xl bg-[#050810]/60 border border-white/5 backdrop-blur-xl">
                        <h2 className="text-lg font-orbitron font-bold text-white mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                             CONNECTED NODES
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="pb-4 font-black">USER / ID</th>
                                        <th className="pb-4 font-black">PLAN</th>
                                        <th className="pb-4 font-black">CREDITS</th>
                                        <th className="pb-4 font-black">JOINED</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {users.map((u) => (
                                        <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center text-[10px] font-black border border-white/5">
                                                        {u.email[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-200 group-hover:text-[#00d4ff] transition-colors">{u.email}</span>
                                                        <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{u.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                    u.plan === 'pro' || u.plan === 'special_pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {u.plan}
                                                </span>
                                            </td>
                                            <td className="py-4 font-mono text-blue-400">{u.credits}</td>
                                            <td className="py-4 text-gray-500 text-xs">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Plans Breakdown */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-[#050810]/60 border border-white/5 backdrop-blur-xl">
                        <h2 className="text-lg font-orbitron font-bold text-white mb-6">PLAN DISTRIBUTION</h2>
                        <div className="space-y-4">
                            {Object.entries(stats?.plans_breakdown || {}).map(([plan, count]) => (
                                <div key={plan} className="space-y-1">
                                    <div className="flex justify-between text-xs font-black tracking-widest uppercase mb-1">
                                        <span className="text-gray-400">{plan}</span>
                                        <span className="text-white">{count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / (stats?.total_users || 1)) * 100}%` }}
                                            className={`h-full rounded-full ${
                                                plan === 'pro' ? 'bg-purple-500' : 
                                                plan === 'special_pro' ? 'bg-green-500' : 
                                                'bg-blue-500'
                                            }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number | string, color: string }) {
    const colors: Record<string, string> = {
        blue: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
        orange: 'text-orange-400 border-orange-400/20 bg-orange-400/5',
        green: 'text-green-400 border-green-400/20 bg-green-400/5',
        purple: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    }

    return (
        <div className={`p-6 rounded-2xl border backdrop-blur-xl ${colors[color]} relative group overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                <Icon size={48} />
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-black/20">
                    <Icon size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className="text-3xl font-orbitron font-black text-white">{value}</div>
        </div>
    )
}
