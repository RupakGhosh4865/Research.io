"use client"
import { Zap } from 'lucide-react'

export default function CreditBadge() {
  // Mock data for now, usually fetched via react-query
  return (
    <div className="bg-[#1A1F2E] rounded-lg p-3 flex items-center justify-between border border-[#ffffff10]">
      <div className="flex items-center gap-2 text-sm">
        <Zap size={16} className="text-[#ff6b35]" />
        <span>Credits</span>
      </div>
      <span className="font-bold text-[#00d4ff]">3 left</span>
    </div>
  )
}
