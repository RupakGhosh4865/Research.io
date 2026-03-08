"use client"
import { UserButton, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, FileText, History, Settings } from 'lucide-react'
import CreditBadge from '@/components/shared/CreditBadge'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in')
    }
  }, [isLoaded, userId, router])

  if (!isLoaded || !userId) return null

  return (
    <div className="flex h-screen bg-[#050810] text-gray-100">
      <aside className="w-64 border-r border-[#ffffff10] flex flex-col bg-[#080B14]">
        <div className="p-6">
          <Link href="/dashboard" className="font-syne text-2xl font-bold flex items-center gap-2">
            <span className="text-[#00d4ff]">Deep</span>Research
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#ffffff0a] transition-colors"><LayoutDashboard size={20}/> Dashboard</Link>
          <Link href="/research/new" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff]"><FileText size={20}/> New Research</Link>
          <Link href="/history" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#ffffff0a] transition-colors"><History size={20}/> History</Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#ffffff0a] transition-colors"><Settings size={20}/> Settings</Link>
        </nav>
        <div className="p-4 border-t border-[#ffffff10]">
          <CreditBadge />
          <div className="flex items-center gap-3 mt-4 px-2">
            <UserButton afterSignOutUrl="/"/>
            <span className="text-sm font-medium">Account</span>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
