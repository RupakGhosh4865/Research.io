"use client"
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, FileText, History, Settings, LogOut, User, CreditCard, Cpu } from 'lucide-react'
import CreditBadge from '@/components/shared/CreditBadge'
import SpiderBackground from '@/components/ui/SpiderBackground'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) return (
    <div className="h-screen bg-[#03050a] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin" />
      <span className="font-orbitron text-sm tracking-widest text-[#00d4ff] animate-pulse">SYNCHRONIZING...</span>
    </div>
  )
  if (!user) return null

  const NavLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href
    return (
      <Link 
        href={href} 
        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
          isActive 
            ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 shadow-[0_0_15px_rgba(0,212,255,0.1)]' 
            : 'text-gray-400 hover:text-white hover:bg-[#ffffff0a]'
        }`}
      >
        {isActive && (
          <motion.div 
            layoutId="nav-active"
            className="absolute left-0 w-1 h-2/3 bg-[#00d4ff] rounded-r-full"
          />
        )}
        <Icon size={20} className={isActive ? 'text-[#00d4ff]' : 'group-hover:text-[#00d4ff] transition-colors'} />
        <span className={`font-outfit font-medium ${isActive ? 'text-white' : ''}`}>{label}</span>
        
        {/* Hover scanning effect */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00d4ff]/50 to-transparent animate-[scan_2s_linear_infinite]" />
        </div>
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-[#03050a] text-gray-100 selection:bg-[#00d4ff]/30">
      <div className="cyber-grid" />
      <SpiderBackground />
      <div className="scan-line" />
      
      <aside className="w-64 border-r border-[#ffffff0a] flex flex-col bg-[#050810]/80 backdrop-blur-xl relative z-30">
        <div className="p-8">
          <Link href="/" className="font-orbitron text-xl font-black flex items-center gap-2 group">
            <div className="p-2 bg-[#00d4ff]/10 rounded-lg group-hover:bg-[#00d4ff]/20 transition-colors">
                <Cpu size={24} className="text-[#00d4ff] group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
                <span className="text-[#00d4ff] text-glow leading-none">RESEARCH</span>
                <span className="text-[10px] tracking-[0.3em] text-gray-500 font-black">SYSTEM.V1</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink href="/dashboard" icon={LayoutDashboard} label="Terminal Index" />
          <NavLink href="/research/new" icon={FileText} label="Initiate Probe" />
          <NavLink href="/history" icon={History} label="Archive Data" />
          <NavLink href="/pricing" icon={CreditCard} label="Resource Node" />
          <NavLink href="/settings" icon={Settings} label="System Config" />
        </nav>
        <div className="p-4 border-t border-[#ffffff0a] space-y-4">
          <CreditBadge />
          <div className="px-2 space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#00d4ff]/5 border border-[#00d4ff]/10">
              <div className="w-8 h-8 rounded-lg bg-[#00d4ff] flex items-center justify-center text-black font-black text-xs">
                {user.email[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate text-white">{user.email.split('@')[0]}</span>
                <span className="text-[10px] text-gray-500 truncate uppercase tracking-tighter">{user.plan} NODE</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="group flex items-center gap-3 w-full text-left px-4 py-2 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
            >
              <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
              <span className="font-medium">TERMINATE SESSION</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/5 to-transparent pointer-events-none h-64" />
        {children}
      </main>
    </div>
  )
}
