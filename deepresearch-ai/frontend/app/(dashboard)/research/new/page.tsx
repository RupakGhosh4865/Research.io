"use client"
import ResearchForm from '@/components/research/ResearchForm'
import { ChevronRight, Cpu } from 'lucide-react'
import Link from 'next/link'

export default function NewResearchPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-500 font-orbitron text-[10px] tracking-[0.2em]">
          <Link href="/dashboard" className="hover:text-[#00d4ff] transition-colors">TERMINAL</Link>
          <ChevronRight size={10} />
          <span className="text-[#00d4ff]">INITIATE_PROBE</span>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00d4ff]/10 rounded-2xl border border-[#00d4ff]/20">
                <Cpu size={32} className="text-[#00d4ff]" />
            </div>
            <div>
                <h1 className="text-4xl font-black font-orbitron tracking-tighter text-glow uppercase">Initiate <span className="text-[#00d4ff]">Intelligence Probe</span></h1>
                <p className="text-gray-500 font-medium text-sm">Configure your search parameters and neural constraints.</p>
            </div>
        </div>
      </div>

      <div>
        <ResearchForm />
      </div>
    </div>
  )
}
