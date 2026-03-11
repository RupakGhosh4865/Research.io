"use client"
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { startResearch, setAuthToken, uploadDocument } from '@/lib/api'
import { useAuthContext } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Zap, Loader2, FileText, ChevronRight, Search } from 'lucide-react'
import FuturisticCard from '@/components/ui/FuturisticCard'

export default function ResearchForm() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const { token } = useAuthContext()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const pdfs = files.filter(f => f.type === "application/pdf" || f.name.endsWith(".pdf"))
      setSelectedFiles(prev => [...prev, ...pdfs])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    try {
      if (token) setAuthToken(token)

      // Upload files first
      const uploadedDocIds: string[] = []
      if (selectedFiles.length > 0) {
        setUploading(true)
        for (const file of selectedFiles) {
          const res = await uploadDocument(file)
          uploadedDocIds.push(res.document_id)
        }
        setUploading(false)
      }

      const res = await startResearch(topic, uploadedDocIds)
      router.push(`/research/${res.session_id}`)
    } catch (err) {
      console.error(err)
      alert("Failed to start research.")
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <FuturisticCard glowColor="#00d4ff" className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-[#00d4ff]" />
            <label className="text-xs font-black font-orbitron tracking-widest text-gray-400 uppercase">Input parameters</label>
          </div>
          <div className="relative group">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-[#080B14]/60 border border-white/10 rounded-2xl p-6 text-lg font-outfit text-white focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/20 transition-all min-h-[180px] resize-none selection:bg-[#00d4ff]/30"
              placeholder="IDENTIFY RESEARCH TARGET... (e.g., Quantum Computing Advancements 2024)"
              required
            />
            {/* Corner deco */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00d4ff]/20 rounded-tr-2xl pointer-events-none group-focus-within:border-[#00d4ff]/50 transition-colors" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00d4ff]/20 rounded-bl-2xl pointer-events-none group-focus-within:border-[#00d4ff]/50 transition-colors" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#00d4ff]" />
            <label className="text-xs font-black font-orbitron tracking-widest text-gray-400 uppercase">Context nodes (PDF)</label>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative cursor-pointer overflow-hidden border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-[#00d4ff]/5 hover:border-[#00d4ff]/20 transition-all rounded-2xl p-8 text-center"
          >
            <input 
              type="file" 
              multiple 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-white/5 text-gray-500 group-hover:text-[#00d4ff] group-hover:scale-110 transition-all duration-300">
                <Upload size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-300">Drag & Drop or <span className="text-[#00d4ff] underline">Browse</span></p>
                <p className="text-[10px] text-gray-500 font-black tracking-tighter uppercase mt-1">Maximum 5 Neural Context Files (.PDF)</p>
              </div>
            </div>
            
            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  {selectedFiles.map((file, i) => (
                    <motion.div 
                      key={i} 
                      layout
                      className="flex items-center justify-between bg-[#080B14] p-3 rounded-xl border border-white/5 group/file"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={16} className="text-[#00d4ff] shrink-0" />
                        <span className="text-xs font-medium text-gray-400 truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(i)}
                        className="p-1 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#ff6b35] animate-pulse" />
            <span className="text-xs font-bold font-orbitron text-gray-500">CONSUMPTION: <span className="text-[#ff6b35]">1 NODE CREDIT</span></span>
          </div>
          <button
            disabled={loading || uploading}
            type="submit"
            className="btn-cyber flex items-center gap-3 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{uploading ? "INJECTING NODES..." : "INITIALIZING PROBE..."}</span>
              </>
            ) : (
              <>
                <span>INITIALIZE PROBE</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </FuturisticCard>
  )
}
