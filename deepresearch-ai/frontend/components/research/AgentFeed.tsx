"use client"
import { useEffect, useState } from 'react'
import { createResearchSSE } from '@/lib/sse'
import { useAuthContext } from '@/context/AuthContext'
import { CheckCircle, Cpu, ShieldAlert, Search, Database, PenTool, ClipboardCheck, Activity, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FuturisticCard from '@/components/ui/FuturisticCard'

export default function AgentFeed({ sessionId, isCompleted, onCompleted }: { sessionId: string, isCompleted?: boolean, onCompleted: (id: string) => void }) {
  const [messages, setMessages] = useState<any[]>([])
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
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-[#00d4ff] rounded-full filter blur-md"
                />
            </div>
            <h3 className="font-orbitron font-black text-xs tracking-widest text-glow">PIPELINE_FEED</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 font-orbitron">LATENCY: 42MS</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#10b981]" />
        </div>
      </div>

      <FuturisticCard glowColor="#00d4ff" className="flex-1 overflow-hidden h-[calc(100vh-400px)]">
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                {messages.length === 0 && !isCompleted && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <Loader2 size={32} className="text-[#00d4ff] animate-spin" />
                        <p className="font-orbitron text-[10px] tracking-[0.3em] text-[#00d4ff] animate-pulse">SYNCHRONIZING AGENT COLLECTIVE...</p>
                    </div>
                )}
                
                {messages.length === 0 && isCompleted && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center space-y-4"
                    >
                        <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20">
                            <CheckCircle className="text-green-500" size={48} />
                        </div>
                        <div>
                            <p className="font-orbitron font-black text-[#00d4ff] tracking-tight">PROBE SEQUENCE COMPLETE</p>
                            <p className="text-xs text-gray-500 font-bold tracking-tighter uppercase mt-1">Intelligence fully synthesized</p>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence mode="popLayout">
                    {messages.map((m, i) => {
                        if (m.type === 'agent_update') {
                            const isThinking = m.status === 'thinking'
                            const glowColor = getGlowColor(m.agent)
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    className="group"
                                >
                                    <div className="flex gap-4">
                                        <div className="relative shrink-0">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAgentColor(m.agent)} p-[1px] shadow-lg group-hover:rotate-12 transition-transform`}>
                                                <div className="w-full h-full bg-[#03050a] rounded-[10px] flex items-center justify-center text-white">
                                                    {getAgentIcon(m.agent)}
                                                </div>
                                            </div>
                                            {isThinking && (
                                                <motion.div 
                                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    style={{ backgroundColor: glowColor }}
                                                    className="absolute -inset-1 rounded-xl filter blur-sm -z-10"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black font-orbitron tracking-widest uppercase`} style={{ color: glowColor }}>
                                                    {m.agent}
                                                </span>
                                                {isThinking && <span className="text-[10px] text-gray-500 font-black animate-pulse">[PROCESSING...]</span>}
                                            </div>
                                            <div className={`p-4 rounded-2xl rounded-tl-none bg-white/[0.03] border border-white/5 font-outfit text-sm leading-relaxed ${isThinking ? 'neon-border' : ''}`}>
                                                <span className="text-gray-300">{m.content}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        }
                        return null
                    })}
                </AnimatePresence>
            </div>
        </div>
      </FuturisticCard>
    </div>
  )
}
