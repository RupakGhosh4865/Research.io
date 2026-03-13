"use client"
import { useAuthContext } from '@/context/AuthContext'
import { User, Shield, CreditCard, Mail, Key, ChevronRight, Activity, Terminal } from 'lucide-react'
import FuturisticCard from '@/components/ui/FuturisticCard'
import Link from 'next/link'

export default function SettingsPage() {
  const { user } = useAuthContext()

  if (!user) return null

  const planColors: any = {
    free: 'text-gray-400',
    starter: 'text-[#00d4ff]',
    pro: 'text-[#8b5cf6]'
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-500 font-orbitron text-[10px] tracking-[0.2em]">
          <Link href="/dashboard" className="hover:text-[#00d4ff] transition-colors">TERMINAL</Link>
          <ChevronRight size={10} />
          <span className="text-[#00d4ff]">SYSTEM_CONFIG</span>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00d4ff]/10 rounded-2xl border border-[#00d4ff]/20">
                <Terminal size={32} className="text-[#00d4ff]" />
            </div>
            <div>
                <h1 className="text-4xl font-black font-orbitron tracking-tighter text-glow uppercase">System <span className="text-[#00d4ff]">Configuration</span></h1>
                <p className="text-gray-500 font-medium text-sm">Manage operative profile and neural node access.</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <div>
            <FuturisticCard glowColor="#00d4ff">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                    <User size={20} className="text-[#00d4ff]" />
                    <h2 className="font-orbitron font-black text-sm tracking-widest text-glow uppercase">Operative Profile</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black font-orbitron tracking-widest text-gray-500 uppercase">Registry Email</label>
                        <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                            <Mail size={16} className="text-gray-600" />
                            <span className="font-outfit text-white font-medium">{user.email}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black font-orbitron tracking-widest text-gray-500 uppercase">Access Protocol</label>
                        <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                            <Shield size={16} className={planColors[user.plan] || 'text-white'} />
                            <span className={`font-outfit font-bold uppercase tracking-wide ${planColors[user.plan] || ''}`}>
                                {user.plan} NODE AUTHORIZED
                            </span>
                        </div>
                    </div>
                </div>
            </FuturisticCard>
        </div>

        {/* Subscription Section */}
        <div>
            <FuturisticCard glowColor="#8b5cf6">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                    <CreditCard size={20} className="text-[#8b5cf6]" />
                    <h2 className="font-orbitron font-black text-sm tracking-widest text-[#8b5cf6] text-glow uppercase">Resource Management</h2>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                    <div className="space-y-1">
                        <p className="font-orbitron font-bold text-gray-200 uppercase">Synchronize Plans</p>
                        <p className="text-xs text-gray-500 font-medium">Calibrate your neural throughput and resource allocation.</p>
                    </div>
                    <Link 
                        href="/pricing"
                        className="btn-cyber flex items-center gap-2"
                    >
                        CALIBRATE NODE <ChevronRight size={16} />
                    </Link>
                </div>
            </FuturisticCard>
        </div>

        {/* Security Section (Placeholder) */}
        <div className="opacity-40 grayscale pointer-events-none">
            <FuturisticCard glowColor="#ff6b35">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                    <Key size={20} className="text-[#ff6b35]" />
                    <h2 className="font-orbitron font-black text-sm tracking-widest text-[#ff6b35] text-glow uppercase">Neural Encryption</h2>
                </div>
                <div className="flex items-center gap-4 p-8 border-2 border-dashed border-white/5 rounded-2xl">
                    <div className="p-3 bg-white/5 rounded-full">
                        <Activity size={24} className="text-gray-600" />
                    </div>
                    <p className="text-xs font-orbitron font-bold text-gray-600 tracking-[0.2em] italic uppercase">Advanced MFA & Bio-link Encryption protocols pending v2.0 update...</p>
                </div>
            </FuturisticCard>
        </div>
      </div>
    </div>
  )
}
