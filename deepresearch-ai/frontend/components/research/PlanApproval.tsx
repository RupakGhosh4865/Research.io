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
    <div className="bg-[#1A1F2E] border border-green-500/30 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-green-400">✓</span> Human Approval Required
      </h3>
      <p className="text-gray-300 mb-4">The Planner agent has generated a strategy. Please review it in the feed below or add additional guidance.</p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Optional: Provide feedback to steer the agents..."
        className="w-full bg-[#050810] border border-[#ffffff20] rounded-lg p-3 text-white mb-4 min-h-[80px]"
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => handleApprove(true)} disabled={loading} className="w-full sm:w-auto bg-green-500/20 text-green-400 border border-green-500/50 px-6 py-2 rounded-lg font-bold hover:bg-green-500/30 transition-colors">
          Looks Good — Start Research
        </button>
        <button onClick={() => handleApprove(false)} disabled={loading} className="w-full sm:w-auto text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-lg transition-colors border border-transparent sm:border-none">
          Cancel
        </button>
      </div>
    </div>
  )
}
