"use client"
import { useEffect, useState } from 'react'
import { createResearchSSE } from '@/lib/sse'
import { useAuth } from '@clerk/nextjs'

export default function AgentFeed({ sessionId, onCompleted }: { sessionId: str, onCompleted: (id: str) => void }) {
  const [messages, setMessages] = useState<any[]>([])
  const { getToken } = useAuth()
  
  useEffect(() => {
    let controller: AbortController | null = null;
    
    const connect = async () => {
        const token = await getToken()
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
  }, [sessionId, getToken, onCompleted])

  return (
    <div className="bg-[#0A0D18] border border-[#ffffff10] rounded-xl h-full flex flex-col font-mono text-sm overflow-hidden">
      <div className="bg-[#1A1F2E] p-3 border-b border-[#ffffff10] flex items-center justify-between">
        <span className="text-gray-400">Pipeline Timeline</span>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto space-y-4">
        {messages.length === 0 && <p className="text-gray-500">Initializing agent collective...</p>}
        {messages.map((m, i) => {
            if (m.type === 'agent_update') {
               const colors: any = { planner: 'text-[#00d4ff]', searcher: 'text-[#ff6b35]', rag: 'text-purple-400', writer: 'text-green-400', critic: 'text-yellow-400'}
               const colorClass = colors[m.agent] || 'text-white'
               return (
                 <div key={i} className={`flex gap-3 ${m.status === 'thinking' ? 'animate-pulse' : ''}`}>
                    <span className={colorClass}>[{m.agent.toUpperCase()}]</span>
                    <span className="text-gray-300">{m.content}</span>
                 </div>
               )
            }
            return null
        })}
      </div>
    </div>
  )
}
