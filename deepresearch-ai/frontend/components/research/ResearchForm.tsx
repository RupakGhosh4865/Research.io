"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startResearch, setAuthToken } from '@/lib/api'
import { useAuth } from '@clerk/nextjs'

export default function ResearchForm() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { getToken } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    
    setLoading(true)
    try {
      const token = await getToken()
      if (token) setAuthToken(token)
      
      const res = await startResearch(topic)
      router.push(`/research/${res.session_id}`)
    } catch (err) {
      console.error(err)
      alert("Failed to start research.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#080B14] p-8 rounded-2xl border border-[#ffffff10]">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-300">Research Topic</label>
        <textarea 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full bg-[#1A1F2E] border border-[#ffffff20] rounded-xl p-4 text-white focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] transition-all min-h-[150px] resize-y"
          placeholder="e.g., The impact of large language models on software engineering productivity"
          required
        />
      </div>
      
      <div className="mb-8 p-6 border-2 border-dashed border-[#ffffff20] rounded-xl text-center bg-[#1A1F2E]/50">
        <p className="text-gray-400 mb-2">Drag & drop PDFs here, or click to select files</p>
        <button type="button" className="px-4 py-2 bg-[#ffffff10] rounded-lg text-sm hover:bg-[#ffffff20] transition-colors">Select Files</button>
      </div>

      <div className="flex items-center justify-between border-t border-[#ffffff10] pt-6">
        <span className="text-sm text-gray-400">Cost: <span className="font-bold text-[#ff6b35]">-1 Credit</span></span>
        <button 
          disabled={loading}
          type="submit" 
          className="bg-[#00d4ff] text-black px-8 py-3 rounded-full font-bold hover:bg-[#00badd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Starting..." : "Start Research"}
        </button>
      </div>
    </form>
  )
}
