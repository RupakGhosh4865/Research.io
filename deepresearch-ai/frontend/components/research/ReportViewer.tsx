import { useEffect, useState } from 'react'
import { getReport } from '@/lib/api'
import { Download, Share2, FileText, Globe, Link as LinkIcon, Lock, Cpu, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FuturisticCard from '@/components/ui/FuturisticCard'

export default function ReportViewer({ reportId }: { reportId?: string }) {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (reportId) {
      setLoading(true)
      getReport(reportId).then(data => {
        setReport(data)
        setLoading(false)
      }).catch(err => {
        console.error(err)
        setLoading(false)
      })
    }
  }, [reportId])

  if (!reportId) {
    return (
      <div className="h-full flex flex-col space-y-4">
        <div className="flex items-center gap-2 px-2">
            <Lock size={14} className="text-[#ff6b35]" />
            <h3 className="font-orbitron font-black text-xs tracking-widest text-[#ff6b35]">NODE_LOCKED</h3>
        </div>
        <FuturisticCard glowColor="#ff6b35" className="flex-1">
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="p-4 bg-[#ff6b35]/10 rounded-full border border-[#ff6b35]/20 animate-pulse">
                    <Cpu size={32} className="text-[#ff6b35]" />
                </div>
                <div className="space-y-1">
                    <p className="font-orbitron font-bold text-gray-400">WAITING FOR SYNTHESIS...</p>
                    <p className="text-[10px] text-gray-500 font-black tracking-tighter uppercase">Intelligence package will appear here</p>
                </div>
            </div>
        </FuturisticCard>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
        >
            <Loader2 size={40} className="text-[#00d4ff] animate-spin" />
            <span className="font-orbitron text-[10px] tracking-[0.5em] text-[#00d4ff] animate-pulse">DECRYPTING DATA CORE...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
            <Globe size={18} className="text-[#00d4ff]" />
            <h3 className="font-orbitron font-black text-xs tracking-widest text-glow">INTELLIGENCE_REPORT // {reportId.slice(0, 8).toUpperCase()}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const token = localStorage.getItem('token');
              const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/reports/${reportId}/export/pdf${token ? `?token=${token}` : ''}`;
              
              setLoading(true);
              try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Download failed');
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `research-report-${reportId.slice(0, 8)}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                document.body.removeChild(a);
              } catch (err) {
                console.error(err);
                alert("Failed to download PDF.");
              } finally {
                setLoading(false);
              }
            }}
            className="btn-cyber !py-1.5 !px-4 !text-[10px] flex items-center gap-2"
          >
            <Download size={14} /> EXPORT_PDF
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-orbitron font-bold transition-all border border-white/5">
            <Share2 size={14} /> SHARE
          </button>
        </div>
      </div>

      <FuturisticCard glowColor="#00d4ff" className="flex-1 overflow-hidden h-[calc(100vh-250px)]">
        <div className="h-full overflow-y-auto custom-scrollbar p-6">
            {report ? (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-12"
            >
                <div className="space-y-4 border-b border-white/5 pb-8">
                    <div className="p-2 w-fit bg-[#00d4ff]/10 rounded-lg border border-[#00d4ff]/20">
                        <FileText size={20} className="text-[#00d4ff]" />
                    </div>
                    <h1 className="text-4xl font-black font-orbitron tracking-tight leading-none text-glow uppercase">{report.topic || report.title}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-gray-500 font-orbitron">CONFIDENCE: 98.7%</span>
                        <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00d4ff] w-[98.7%]" />
                        </div>
                    </div>
                </div>

                <div className="font-outfit text-gray-300 leading-relaxed text-lg space-y-6">
                    {report.content?.split('\n').map((line: string, i: number) => {
                        if (line.startsWith('# ')) return <h2 key={i} className="text-2xl font-black font-orbitron text-white mt-12 mb-4 uppercase text-[#00d4ff]">{line.replace('# ', '')}</h2>
                        if (line.startsWith('## ')) return <h3 key={i} className="text-xl font-bold font-orbitron text-white mt-8 mb-3 uppercase border-l-2 border-[#00d4ff] pl-4">{line.replace('## ', '')}</h3>
                        if (!line.trim()) return null
                        return <p key={i} className="mb-4">{line}</p>
                    })}
                </div>

                {report.citations && report.citations.length > 0 && (
                <div className="mt-16 pt-12 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-2">
                        <LinkIcon size={18} className="text-[#8b5cf6]" />
                        <h3 className="text-xl font-black font-orbitron uppercase tracking-widest text-[#8b5cf6]">Neural Sources</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.citations.map((c: any, i: number) => (
                        <a 
                            key={i} 
                            href={c.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5 transition-all group"
                        >
                            <span className="font-orbitron font-black text-xs text-[#8b5cf6] opacity-30 group-hover:opacity-100 transition-opacity">[{i + 1}]</span>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-gray-300 group-hover:text-white truncate">{c.title || c.url}</h4>
                                <span className="text-[10px] font-medium text-gray-600 truncate block mt-1 uppercase tracking-tighter">{new URL(c.url).hostname}</span>
                            </div>
                        </a>
                    ))}
                    </div>
                </div>
                )}
            </motion.div>
            ) : (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 font-orbitron animate-pulse">UNABLE TO LOAD DATA NODE.</p>
            </div>
            )}
        </div>
      </FuturisticCard>
    </div>
  )
}
