"use client"
import React, { useMemo } from 'react'
import { Search, Database, PenTool, ClipboardCheck, ShieldAlert, Cpu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AGENTS = [
    { id: 'planner', label: 'PLANNER', icon: ClipboardCheck, x: 50, y: 15, color: '#00d4ff' },
    { id: 'searcher', label: 'SEARCHER', icon: Search, x: 20, y: 50, color: '#ff6b35' },
    { id: 'rag', label: 'RAG_ENGINE', icon: Database, x: 50, y: 50, color: '#8b5cf6' },
    { id: 'writer', label: 'WRITER', icon: PenTool, x: 80, y: 50, color: '#10b981' },
    { id: 'critic', label: 'CRITIC', icon: ShieldAlert, x: 50, y: 85, color: '#f59e0b' },
]

const CONNECTIONS = [
    { from: 'planner', to: 'searcher' },
    { from: 'planner', to: 'rag' },
    { from: 'planner', to: 'writer' },
    { from: 'searcher', to: 'rag' },
    { from: 'rag', to: 'writer' },
    { from: 'writer', to: 'critic' },
    { from: 'critic', to: 'writer' },
]

export default function AgentPipeline({ activeAgent, status }: { activeAgent?: string, status?: string }) {
    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto p-4 bg-[#03050a]/50 rounded-3xl border border-white/5 shadow-2xl overflow-hidden group">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#00d4ff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    
                    {AGENTS.map(agent => (
                        <radialGradient key={`grad-${agent.id}`} id={`grad-${agent.id}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={agent.color} stopOpacity="0.6" />
                            <stop offset="100%" stopColor={agent.color} stopOpacity="0" />
                        </radialGradient>
                    ))}

                    <linearGradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                {/* Connections */}
                {CONNECTIONS.map((conn, i) => {
                    const fromNode = AGENTS.find(n => n.id === conn.from)!
                    const toNode = AGENTS.find(n => n.id === conn.to)!
                    const isActive = activeAgent === conn.from || activeAgent === conn.to
                    const isFlowing = activeAgent === conn.from
                    
                    return (
                        <g key={`conn-${i}`}>
                            <motion.path
                                d={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                                stroke={isActive ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)'}
                                strokeWidth="0.5"
                                fill="none"
                                initial={false}
                                animate={{ stroke: isActive ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)' }}
                            />
                            
                            {isFlowing && (
                                <motion.circle
                                    r="0.8"
                                    fill="#00d4ff"
                                    filter="url(#glow)"
                                >
                                    <animateMotion
                                        dur="2s"
                                        repeatCount="indefinite"
                                        path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                                    />
                                </motion.circle>
                            )}
                        </g>
                    )
                })}

                {/* Agent Nodes */}
                {AGENTS.map((agent) => {
                    const isActive = activeAgent === agent.id
                    const Icon = agent.icon
                    
                    return (
                        <g key={agent.id} className="cursor-default">
                            {/* Glow Aura */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.circle
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        cx={agent.x} cy={agent.y} r="8"
                                        fill={`url(#grad-${agent.id})`}
                                        className="pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>

                            {/* Outer Ring */}
                            <motion.circle
                                cx={agent.x} cy={agent.y} r="6"
                                fill="none"
                                stroke={isActive ? agent.color : 'rgba(255,255,255,0.1)'}
                                strokeWidth="0.5"
                                strokeDasharray={isActive ? "2 1" : "none"}
                                animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Node Core */}
                            <motion.circle
                                cx={agent.x} cy={agent.y} r="4.5"
                                fill="#050810"
                                stroke={isActive ? agent.color : 'rgba(255,255,255,0.05)'}
                                strokeWidth="1"
                                whileHover={{ scale: 1.1 }}
                                animate={isActive ? { 
                                    boxShadow: `0 0 20px ${agent.color}`,
                                    scale: [1, 1.05, 1]
                                } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                                filter={isActive ? 'url(#glow)' : 'none'}
                            />

                            {/* Icon */}
                            <foreignObject x={agent.x - 2.5} y={agent.y - 2.5} width="5" height="5">
                                <motion.div 
                                    className="w-full h-full flex items-center justify-center"
                                    animate={{ color: isActive ? agent.color : 'rgba(255,255,255,0.3)' }}
                                >
                                    <Icon size={3.5} strokeWidth={2.5} />
                                </motion.div>
                            </foreignObject>

                            {/* Label */}
                            <motion.text
                                x={agent.x} y={agent.y + 10}
                                textAnchor="middle"
                                fontSize="2.2"
                                className="font-orbitron font-black tracking-[0.2em]"
                                animate={{ 
                                    fill: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
                                    opacity: isActive ? 1 : 0.6
                                }}
                            >
                                {agent.label}
                            </motion.text>
                            
                            {/* Status Indicator */}
                            {isActive && (
                                <g>
                                    <circle cx={agent.x + 4} cy={agent.y - 4} r="1" fill={agent.color}>
                                        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                                    </circle>
                                </g>
                            )}
                        </g>
                    )
                })}
            </svg>

            {/* Floating Data Particles */}
            <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence>
                    {activeAgent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent animate-scan-fast" style={{ top: '20%' }} />
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent animate-scan-fast" style={{ top: '50%', animationDelay: '1s' }} />
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent animate-scan-fast" style={{ top: '80%', animationDelay: '0.5s' }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
