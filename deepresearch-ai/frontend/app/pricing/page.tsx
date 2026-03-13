"use client"
import { useState } from 'react'
import { Check, ArrowRight, Zap, Shield, Cpu, ChevronRight, Activity } from 'lucide-react'
import api from '@/lib/api'
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import FuturisticCard from '@/components/ui/FuturisticCard'
import Link from 'next/link'

const tiers = [
  {
    name: 'BASIC NODE',
    id: 'free',
    price: '0',
    description: 'Entry-level access to the agent collective.',
    features: ['3 Neural Credits / mo', 'Standard Research Quality', 'PDF Data Export'],
    buttonText: 'CURRENT_PROTOCOL',
    highlighted: false,
    glow: '#94a3b8'
  },
  {
    name: 'STARTER NODE',
    id: 'starter',
    price: '29',
    description: 'Accelerated intelligence for individuals.',
    features: ['50 Neural Credits / mo', 'Enhanced Neural Quality', 'Priority Pipeline Access', '5 Context Documents'],
    buttonText: 'INITIALIZE_UPGRADE',
    highlighted: true,
    glow: '#00d4ff'
  },
  {
    name: 'ELITE PROBE',
    id: 'pro',
    price: '99',
    description: 'Maximum throughput for power operatives.',
    features: ['200 Neural Credits / mo', 'Elite Research Quality', 'Unlimited Context Nodes', 'Custom Neural Branding', 'Direct API Bridge'],
    buttonText: 'MAXIMIZE_THROUGHPUT',
    highlighted: false,
    glow: '#8b5cf6'
  }
]

export default function PricingPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (plan: string) => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (plan === 'free') return

    setLoading(plan)
    try {
      const res = await api.post('/payments/create-checkout-session', null, { params: { plan } })
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err) {
      console.error(err)
      alert("Failed to initiate payment.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#03050a] text-white py-24 px-6 relative overflow-hidden">
      <div className="cyber-grid" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#00d4ff]/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] font-orbitron text-[10px] tracking-[0.4em] mb-4">
            <Activity size={14} />
            RESOURCE_ALLOCATION_MATRIX
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-orbitron tracking-tighter text-glow uppercase leading-none">
            Neural <span className="text-[#00d4ff]">Nodes</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto font-outfit">
            Calibrate your operational capacity. Select a neural node to scale your research intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div key={tier.name}>
                <FuturisticCard glowColor={tier.glow} className="h-full">
                    <div className="space-y-8 h-full flex flex-col">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black font-orbitron text-white tracking-widest leading-none outline-text">{tier.name}</h3>
                                {tier.highlighted && (
                                    <span className="p-1 px-3 bg-[#00d4ff] text-black text-[10px] font-black font-orbitron rounded uppercase tracking-tighter">OPTIMAL</span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`${tier.highlighted ? 'text-glow' : ''} text-5xl font-black font-orbitron`} style={{ color: tier.glow }}>${tier.price}</span>
                                <span className="text-gray-500 font-orbitron text-xs font-bold uppercase tracking-widest">/ SESSION_CYCLE</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 font-medium leading-relaxed font-outfit h-12">
                            {tier.description}
                        </p>
                        
                        <div className="flex-1 space-y-4">
                            <div className="h-px bg-white/5 w-full" />
                            <ul className="space-y-4">
                                {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-xs font-bold font-orbitron text-gray-500 uppercase tracking-tighter">
                                    <div className="shrink-0 mt-0.5 p-0.5 rounded bg-white/5 transition-colors group-hover:bg-[#00d4ff]/20">
                                        <Check className="text-[#00d4ff]" size={12} />
                                    </div>
                                    <span className="group-hover:text-gray-300 transition-colors">{feature}</span>
                                </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            disabled={loading !== null || (user?.plan === tier.id)}
                            onClick={() => handleUpgrade(tier.id)}
                            className={`btn-cyber flex items-center justify-center gap-2 w-full ${
                                user?.plan === tier.id ? 'opacity-50 !cursor-default' : ''
                            }`}
                            style={{ 
                                borderColor: tier.glow,
                                color: (user?.plan === tier.id) ? '#999' : tier.glow 
                            }}
                        >
                            {loading === tier.id ? (
                                <Activity size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <span>{user?.plan === tier.id ? 'ACTIVE_PROTOCOL' : tier.buttonText}</span>
                                    {user?.plan !== tier.id && tier.id !== 'free' && <ChevronRight size={18} />}
                                </>
                            )}
                        </button>
                    </div>
                </FuturisticCard>
            </div>
          ))}
        </div>

        <div className="text-center pt-20">
            <p className="font-orbitron text-[10px] text-gray-600 tracking-[0.5em] uppercase">Enterprise Grade Infrastructure // Secure Ledger 1024-AES</p>
        </div>
      </div>
    </div>
  )
}
