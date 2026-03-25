"use client"
import { useEffect, useState, useRef } from 'react'
import { createResearchSSE } from '@/lib/sse'
import { useAuthContext } from '@/context/AuthContext'
import { CheckCircle, Cpu, ShieldAlert, Search, Database, PenTool, ClipboardCheck, Activity, Loader2, Zap } from 'lucide-react'
import FuturisticCard from '@/components/ui/FuturisticCard'
import AgentPipeline from './AgentPipeline'

export default function AgentFeed({ sessionId, isCompleted, onCompleted, onPlanningDone }: { sessionId: string, isCompleted?: boolean, onCompleted: (id: string) => void, onPlanningDone?: () => void }) {
  const [messages, setMessages] = useState<any[]>([])
  const [activeAgent, setActiveAgent] = useState<string | undefined>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { token } = useAuthContext()

  useEffect(() => {
    let controller: AbortController | null = null;

    const connect = async () => {
      if (!token) return

      controller = createResearchSSE(sessionId, token,
        (msg) => {
          if (msg.type === 'heartbeat') return
          if (msg.type === 'completed') {
            onCompleted(msg.report_id)
            setActiveAgent(undefined)
          }
          if (msg.type === 'agent_update') {
            setActiveAgent(msg.agent)
            if (msg.agent === 'planner' && msg.status === 'completed' && onPlanningDone) {
              onPlanningDone()
            }
          }
          setMessages(prev => [...prev, msg])
        },
        (err) => console.error(err)
      )
    }

    connect()

    return () => {
      if (controller) controller.abort()
    }
  }, [sessionId, token, onCompleted])

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const getAgentIcon = (agent: string) => {
    switch (agent) {
        case 'planner': return <ClipboardCheck size={16} />
        case 'searcher': return <Search size={16} />
        case 'rag': return <Database size={16} />
        case 'writer': return <PenTool size={16} />
        case 'critic': return <ShieldAlert size={16} />
        default: return <Cpu size={16} />
    }
  }

  const getAgentColor = (agent: string) => {
    const colors: any = { 
        planner: 'from-[#00d4ff] to-[#0088ff]', 
        searcher: 'from-[#ff6b35] to-[#ff3d00]', 
        rag: 'from-[#8b5cf6] to-[#6d28d9]', 
        writer: 'from-[#10b981] to-[#047857]', 
        critic: 'from-[#f59e0b] to-[#b45309]' 
    }
    return colors[agent] || 'from-gray-400 to-gray-600'
  }

  const getGlowColor = (agent: string) => {
    const colors: any = { 
        planner: '#00d4ff', 
        searcher: '#ff6b35', 
        rag: '#8b5cf6', 
        writer: '#10b981', 
        critic: '#f59e0b' 
    }
    return colors[agent] || '#ffffff'
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
            <div className="relative">
                <Activity size={20} className="text-[#00d4ff]" />
                <div className="absolute inset-0 bg-[#00d4ff]/20 rounded-full filter blur-md" />
            </div>
            <h3 className="font-orbitron font-black text-xs tracking-widest text-glow">LIVE PROGRESS</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 font-orbitron">STATUS: ONLINE</span>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#10b981]" />
        </div>
      </div>

      <FuturisticCard glowColor="#00d4ff" className="flex-1 overflow-hidden min-h-[500px] lg:h-[calc(100vh-220px)]">
        <div className="h-full flex flex-col p-4">
            {/* Neural Pipeline Visualization */}
            <div className="mb-8 border-b border-white/5 pb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00d4ff]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00d4ff]" />
                <AgentPipeline activeAgent={activeAgent} />
                <div className="mt-4 flex justify-between items-center px-4">
                    <div className="flex items-center gap-2">
                        <Zap size={10} className={activeAgent ? "text-[#00d4ff] animate-pulse" : "text-gray-600"} />
                        <span className="text-[8px] font-black font-orbitron tracking-tighter text-gray-500 uppercase">Status: {activeAgent ? 'WORKING' : 'WAITING'}</span>
                    </div>
                    <div className="flex gap-1">
                        {[1,2,3,4].map(i => <div key={i} className={`w-1 h-3 rounded-full ${activeAgent ? 'bg-[#00d4ff] animate-pulse' : 'bg-gray-800'}`} style={{ animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar" ref={scrollRef}>
                {messages.length === 0 && !isCompleted && (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                        <Loader2 size={32} className="text-[#00d4ff] animate-spin" />
                        <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#00d4ff]">CONNECTING TO AGENTS...</p>
                    </div>
                )}
                
                {messages.length === 0 && isCompleted && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20">
                            <CheckCircle className="text-green-500" size={48} />
                        </div>
                        <div>
                            <p className="font-orbitron font-black text-[#00d4ff] tracking-tight">RESEARCH FINISHED</p>
                            <p className="text-xs text-gray-500 font-bold tracking-tighter uppercase mt-1">Your report is ready</p>
                        </div>
                    </div>
                )}

                {messages.map((m, i) => {
                    if (m.type === 'agent_update') {
                        const isThinking = m.status === 'thinking'
                        const glowColor = getGlowColor(m.agent)
                        return (
                            <div key={i} className="group">
                                <div className="flex gap-4">
                                    <div className="relative shrink-0">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAgentColor(m.agent)} p-[1px] shadow-lg group-hover:rotate-12 transition-transform`}>
                                            <div className="w-full h-full bg-[#03050a] rounded-[10px] flex items-center justify-center text-white">
                                                {getAgentIcon(m.agent)}
                                            </div>
                                        </div>
                                        {isThinking && (
                                            <div 
                                                style={{ backgroundColor: glowColor }}
                                                className="absolute -inset-1 rounded-xl filter blur-sm opacity-20 -z-10"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black font-orbitron tracking-widest uppercase`} style={{ color: glowColor }}>
                                                {m.agent}
                                            </span>
                                            {isThinking && <span className="text-[10px] text-gray-500 font-black animate-pulse">[WORKING...]</span>}
                                        </div>
                                        <div className={`p-4 rounded-2xl rounded-tl-none bg-white/[0.03] border border-white/5 font-outfit text-sm leading-relaxed ${isThinking ? 'neon-border' : ''}`}>
                                            <span className="text-gray-300">{m.content}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    return null
                })}
            </div>
        </div>
      </FuturisticCard>
    </div>
  )
}
