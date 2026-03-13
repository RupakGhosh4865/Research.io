"use client"
import { useEffect, useState } from 'react'
import { getUserStats, setAuthToken } from '@/lib/api'
import Link from 'next/link'
import { ArrowRight, Clock, Zap, FileSearch, BarChart3, ChevronRight, Activity } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import FuturisticCard from '@/components/ui/FuturisticCard'

export default function Dashboard() {
  const { token } = useAuthContext()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      getUserStats()
        .then(data => {
          setStats(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [token])

  if (loading) {
     return (
       <div className="p-8 h-full flex items-center justify-center">
         <div className="flex flex-col items-center gap-6">
           <div className="relative">
             <div className="w-16 h-16 border-2 border-[#00d4ff]/10 rounded-full" />
             <div className="absolute top-0 left-0 w-16 h-16 border-2 border-t-[#00d4ff] rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
               <Activity size={24} className="text-[#00d4ff]" />
             </div>
           </div>
           <span className="font-orbitron text-xs tracking-[0.5em] text-[#00d4ff]">FETCHING CORE DATA...</span>
         </div>
       </div>
     )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[#00d4ff] font-orbitron text-[10px] tracking-[0.4em] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />
            SYSTEM ONLINE // SESSION ACTIVE
        </div>
        <h1 className="text-5xl font-black font-orbitron tracking-tighter text-glow">
          TERMINAL <span className="text-[#00d4ff]">OVERVIEW</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-2xl">
          Welcome back, operative. All research nodes are operational. System integrity at 98.4%.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
            <FuturisticCard glowColor="#00d4ff" className="h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-[#00d4ff]/10 rounded-xl text-[#00d4ff]">
                        <Zap size={24} />
                    </div>
                    <span className="text-[10px] font-orbitron text-gray-500 tracking-widest uppercase">Available Credits</span>
                </div>
                <div className="space-y-1">
                    <p className="text-5xl font-black font-orbitron">{stats?.credits_remaining ?? 0}</p>
                    <p className="text-xs text-[#00d4ff] font-bold uppercase tracking-widest">Neural Resources</p>
                </div>
                <Link href="/pricing" className="mt-8 flex items-center justify-between group/link p-3 rounded-lg bg-white/5 hover:bg-[#00d4ff]/10 transition-colors border border-white/5 hover:border-[#00d4ff]/30">
                    <span className="text-xs font-bold font-orbitron text-gray-400 group-hover/link:text-white transition-colors">TOP UP NODE</span>
                    <ArrowRight size={14} className="text-gray-600 group-hover/link:text-[#00d4ff] transition-all transform group-hover/link:translate-x-1" />
                </Link>
            </FuturisticCard>
        </div>

        <div>
            <FuturisticCard glowColor="#ff6b35" className="h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-[#ff6b35]/10 rounded-xl text-[#ff6b35]">
                        <FileSearch size={24} />
                    </div>
                    <span className="text-[10px] font-orbitron text-gray-500 tracking-widest uppercase">Total Reports</span>
                </div>
                <div className="space-y-1">
                    <p className="text-5xl font-black font-orbitron">{stats?.total_reports ?? 0}</p>
                    <p className="text-xs text-[#ff6b35] font-bold uppercase tracking-widest">Archived Intelligence</p>
                </div>
                <div className="mt-8 flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
                    <span className="text-[10px] font-bold font-orbitron text-gray-500">SYNCED WITH CLOUD NODE</span>
                </div>
            </FuturisticCard>
        </div>

        <div>
            <FuturisticCard glowColor="#8b5cf6" className="h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6]">
                        <BarChart3 size={24} />
                    </div>
                    <span className="text-[10px] font-orbitron text-gray-500 tracking-widest uppercase">Quality Factor</span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-black font-orbitron">{stats?.avg_quality_score ?? 0}</p>
                        <span className="text-lg font-bold text-gray-600">/ 10</span>
                    </div>
                    <p className="text-xs text-[#8b5cf6] font-bold uppercase tracking-widest">Cognitive Index</p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#080B14] bg-gradient-to-br from-[#8b5cf6] to-[#00d4ff]" />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold font-orbitron text-gray-500 italic">SYSTEM OPTIMIZED</span>
                </div>
            </FuturisticCard>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black font-orbitron uppercase">Recent <span className="text-[#00d4ff]">Intelligence</span></h2>
            <p className="text-xs text-gray-500 tracking-widest">CHRONOLOGICAL PROBE HISTORY</p>
          </div>
          <Link href="/research/new" className="btn-cyber flex items-center gap-2">
            INITIATE PROBE <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {stats?.recent_sessions?.length > 0 ? (
            <>
              {stats.recent_sessions.map((session: any) => (
                <div key={session.id}>
                  <Link 
                    href={`/research/${session.id}`}
                    className="flex items-center justify-between p-6 rounded-2xl bg-[#080B14]/40 border border-[#ffffff0a] hover:border-[#00d4ff]/30 hover:bg-[#ffffff05] transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00d4ff] transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#00d4ff]/10 text-[#00d4ff] group-hover:scale-110 transition-transform border border-[#00d4ff]/10">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black font-orbitron text-gray-300 group-hover:text-white transition-colors">{session.topic}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-[#00d4ff] tracking-widest">{new Date(session.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">STATUS: <span className={session.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}>{session.status}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#00d4ff]/20 transition-colors">
                        <ArrowRight size={18} className="text-gray-600 group-hover:text-[#00d4ff] transition-all transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </div>
              ))}
            </>
          ) : (
            <div className="p-16 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-full text-gray-600">
                <FileSearch size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-orbitron font-bold text-gray-400">NO ACTIVE PROBE DATA</h3>
                <p className="text-xs text-gray-600">Initiate your first research probe to populate this archive.</p>
              </div>
              <Link href="/research/new" className="mt-4 text-[10px] font-black tracking-[0.2em] text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors">
                CLICK TO INITIALIZE
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
