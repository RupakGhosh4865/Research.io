"use client"
import { Zap } from 'lucide-react'
import { useState } from 'react'
import CreditPurchaseModal from './CreditPurchaseModal'
import { useCredits } from '@/hooks/useCredits'

export default function CreditBadge() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { credits, isLoading } = useCredits()

  let colorClass = "text-[#00d4ff]"
  if (!isLoading) {
    if (credits <= 1) colorClass = "text-red-500"
    else if (credits <= 5) colorClass = "text-yellow-500"
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-[#1A1F2E] hover:bg-[#2A2F3E] transition-colors rounded-lg p-3 flex items-center justify-between border border-[#ffffff10]"
      >
        <div className="flex items-center gap-2 text-sm">
          <Zap size={16} className="text-[#ff6b35]" />
          <span>Credits</span>
        </div>
        <span className={`font-bold transition-colors ${colorClass}`}>
            {isLoading ? "..." : `${credits} left`}
        </span>
      </button>
      
      {isModalOpen && <CreditPurchaseModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}
