"use client"
import { useCredits } from '@/hooks/useCredits'
import { useState } from 'react'

export default function CreditPurchaseModal({ onClose }: { onClose: () => void }) {
  const { credits } = useCredits()
  const [loading, setLoading] = useState(false)

  const handleBuy = async (priceId: str) => {
    setLoading(true)
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          price_id: priceId, 
          success_url: `${window.location.origin}/research/success`,
          cancel_url: `${window.location.origin}/dashboard`
        })
      })
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080B14] border border-[#ffffff10] rounded-2xl p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-syne font-bold">Add Credits</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-8">Current balance: <span className="font-bold text-white">{credits} credits</span></p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1A1F2E] p-6 rounded-xl border border-[#ffffff10]">
            <h3 className="text-xl font-bold mb-2">Starter</h3>
            <p className="text-3xl font-bold mb-4">$9</p>
            <p className="text-gray-400 mb-6">20 research reports</p>
            <button 
              disabled={loading}
              onClick={() => handleBuy(process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!)}
              className="w-full bg-[#ffffff10] hover:bg-[#ffffff20] py-2 rounded-full transition-colors"
            >
              Buy
            </button>
          </div>
          
          <div className="bg-[#1A1F2E] p-6 rounded-xl border border-[#00d4ff] relative shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <div className="absolute top-0 right-0 bg-[#00d4ff] text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">BEST VALUE</div>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <p className="text-3xl font-bold mb-4 text-[#00d4ff]">$29</p>
            <p className="text-gray-400 mb-6">100 research reports</p>
            <button 
              disabled={loading}
              onClick={() => handleBuy(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!)}
              className="w-full bg-[#00d4ff] text-black hover:bg-[#00badd] font-bold py-2 rounded-full transition-colors"
            >
              Buy
            </button>
          </div>
          
          <div className="bg-[#1A1F2E] p-6 rounded-xl border border-[#ffffff10]">
             <h3 className="text-xl font-bold mb-2">Unlimited Month</h3>
            <p className="text-3xl font-bold mb-4">$79</p>
            <p className="text-gray-400 mb-6">500 research reports</p>
            <button 
              disabled={loading}
              onClick={() => handleBuy("price_unlimited_mock_id")}
              className="w-full bg-[#ffffff10] hover:bg-[#ffffff20] py-2 rounded-full transition-colors"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
