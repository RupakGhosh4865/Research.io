"use client"
import { useState } from 'react'
import { Check, ArrowRight, Zap, Shield, Cpu, ChevronRight, Activity } from 'lucide-react'
import api from '../../lib/api'
import { useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import FuturisticCard from '@/components/ui/FuturisticCard'
import Link from 'next/link'

const tiers = [
  {
    name: 'Free Plan',
    id: 'free',
    price: '0',
    description: 'Perfect for trying out our research tools.',
    features: ['5 Research Papers', '1 Document Upload', 'PDF Downloads'],
    buttonText: 'Current Plan',
    highlighted: false,
    glow: '#94a3b8'
  },
  {
    name: 'Test Upgrade',
    id: 'test',
    price: '1',
    description: 'Unlock more capacity for a tiny fee.',
    features: ['10 Research Papers', '3 Document Uploads', 'PDF Downloads'],
    buttonText: 'Upgrade Now',
    highlighted: false,
    glow: '#00d4ff'
  },
  {
    name: 'Pro Plan',
    id: 'starter',
    price: '199',
    description: 'Serious power for regular researchers.',
    features: ['30 Research Papers', '10 Document Uploads', 'Priority Support', 'PDF Downloads'],
    buttonText: 'Upgrade to Pro',
    highlighted: true,
    glow: '#00d4ff'
  },
  {
    name: 'Special Pro',
    id: 'pro',
    price: '499',
    description: 'Expert level research for heavy users.',
    features: ['50 Research Papers', '30 Document Uploads', 'Dedicated Support', 'PDF Downloads'],
    buttonText: 'Get Special Pro',
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
      const res = await api.post('/payments/create-order', null, { params: { plan } })
      const { order_id, amount, currency, key_id, user_email, user_name } = res.data

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "DeepResearch AI",
        description: `${plan.toUpperCase()} Node Subscription`,
        order_id: order_id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            await api.post('/webhooks/razorpay-verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
              plan: plan
            })
            router.push('/dashboard?payment=success')
          } catch (err) {
            console.error("Verification failed", err)
            alert("Payment verification failed. Please contact support.")
          }
        },
        prefill: {
          name: user_name,
          email: user_email,
        },
        theme: {
          color: "#00d4ff",
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
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
            PRICING_PLANS
          </div>
          <h1 className="text-5xl md:text-8xl font-black font-orbitron tracking-tighter text-glow uppercase leading-none">
            Our <span className="text-[#00d4ff]">Pricing</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto font-outfit">
            Choose the best plan for your research needs. Upgrade anytime to unlock more power.
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
                                <span className={`${tier.highlighted ? 'text-glow' : ''} text-5xl font-black font-orbitron`} style={{ color: tier.glow }}>₹{tier.price}</span>
                                <span className="text-gray-500 font-orbitron text-xs font-bold uppercase tracking-widest">/ ONE TIME</span>
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
                                    <span>{user?.plan === tier.id ? 'Current Plan' : tier.buttonText}</span>
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
            <p className="font-orbitron text-[10px] text-gray-600 tracking-[0.5em] uppercase">Simple Payments // Secure Checkout with Razorpay</p>
        </div>
      </div>
    </div>
  )
}
