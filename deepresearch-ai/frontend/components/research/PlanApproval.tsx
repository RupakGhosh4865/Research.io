"use client"
import { useState } from 'react'
import { approveResearchPlan } from '../../lib/api'

export default function PlanApproval({ sessionId, onApproved }: { sessionId: string, onApproved: () => void }) {
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)

  const handleApprove = async (approved: boolean) => {
    setLoading(true)
    try {
      await approveResearchPlan(sessionId, approved, feedback)
      onApproved()
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1F2E] border border-green-500/30 rounded-xl p-4 sm:p-5 mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -z-10" />
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <span className="text-green-400">✓</span> Human Approval Required
      </h3>
      <p className="text-xs text-gray-400 mb-4 italic">
        The Planner agent has formulated a strategy. <span className="text-green-400/80 font-bold uppercase tracking-tighter">Review it in the live feed below</span> and provide feedback or approve to continue.
      </p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Optional: Provide feedback to steer the agents..."
        className="w-full bg-[#050810] border border-[#ffffff20] rounded-lg p-3 text-sm text-white mb-4 min-h-[60px] focus:border-green-500/50 outline-none transition-all"
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={() => handleApprove(true)} 
          disabled={loading} 
          className="w-full sm:w-auto bg-green-500/20 text-green-400 border border-green-500/50 px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.1)]"
        >
          {loading ? "Processing..." : "Looks Good — Start Research"}
        </button>
        <button 
          onClick={() => handleApprove(false)} 
          disabled={loading} 
          className="w-full sm:w-auto text-red-500/70 hover:text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-lg text-sm transition-colors border border-transparent"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
