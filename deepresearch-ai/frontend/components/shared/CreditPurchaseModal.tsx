"use client"
import { useCredits } from '@/hooks/useCredits'
import Link from 'next/link'

export default function CreditPurchaseModal({ onClose }: { onClose: () => void }) {
  const { credits } = useCredits()

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#080B14] border border-[#ffffff10] rounded-2xl p-8 max-w-2xl w-full text-center">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-syne font-bold">Add Credits</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <p className="text-gray-400 mb-8">Current balance: <span className="font-bold text-white">{credits} credits</span></p>

        <div className="bg-[#1A1F2E] p-8 rounded-xl border border-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
          <h3 className="text-2xl font-bold mb-4">Upgrade Plan</h3>
          <p className="text-gray-400 mb-6">
            Get more research credits, higher quality reports, and advanced features by upgrading your subscription.
          </p>
          <Link 
            href="/pricing"
            onClick={onClose}
            className="inline-block bg-[#00d4ff] text-black hover:bg-[#00badd] font-bold py-3 px-8 rounded-full transition-colors"
          >
            Vew Pricing Plans
          </Link>
        </div>
      </div>
    </div>
  )
}
