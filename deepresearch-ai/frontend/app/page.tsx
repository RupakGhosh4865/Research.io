"use client"
import Link from 'next/link'
import { ArrowRight, Bot, Search, Zap, Shield, BarChart3, ChevronRight, Cpu, Activity, Globe, ZapOff } from 'lucide-react'
import SpiderBackground from '@/components/ui/SpiderBackground'
import FuturisticCard from '@/components/ui/FuturisticCard'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#03050a] text-white selection:bg-[#00d4ff]/30 overflow-x-hidden">
      {/* Infrastructure Layer */}
      <div className="cyber-grid" />
      <SpiderBackground />
      <div className="scan-line" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050810]/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-orbitron text-2xl font-black flex items-center gap-2 group">
             <div className="p-2 bg-[#00d4ff]/10 rounded-lg group-hover:bg-[#00d4ff]/20 transition-colors">
                <Cpu size={24} className="text-[#00d4ff] group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
                <span className="text-[#00d4ff] text-glow leading-none uppercase tracking-tighter">Research.io</span>
                <span className="text-[10px] tracking-[0.3em] text-gray-500 font-black">SYSTEM.V1</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black font-orbitron tracking-widest text-gray-500 uppercase">
            <a href="#features" className="hover:text-[#00d4ff] transition-colors">Features</a>
            <a href="#process" className="hover:text-[#00d4ff] transition-colors">How it works</a>
            <a href="/pricing" className="hover:text-[#00d4ff] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[10px] font-black font-orbitron tracking-[0.2em] hover:text-[#00d4ff] transition-colors uppercase">Login</Link>
            <Link href="/signup" className="btn-cyber !py-2 !px-6 !text-[10px]">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto text-center z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] font-orbitron text-[10px] tracking-[0.4em] mb-4">
            <Activity size={14} />
            AI RESEARCH READY
          </div>
          <h1 className="text-6xl md:text-[120px] font-black font-orbitron leading-none tracking-tighter text-glow uppercase">
            Smart <br />
            <span className="text-[#00d4ff] outline-text">Research.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto font-medium font-outfit leading-relaxed">
            Use powerful AI agents to research, validate, and write professional papers in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link href="/signup" className="btn-cyber flex items-center gap-3 group px-12 py-5 text-lg">
              GET STARTED <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="font-orbitron font-black text-xs tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-glow">
              <Zap size={16} className="text-[#ff6b35]" /> SEE IT IN ACTION
            </Link>
          </div>
        </div>

        {/* Live Terminal Preview */}
        <div className="mt-32 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4ff]/20 via-[#8b5cf6]/20 to-[#ff6b35]/20 rounded-3xl blur-2xl -z-10" />
            <FuturisticCard glowColor="#00d4ff">
                <div className="flex items-center gap-2 mb-6 bg-[#03050a] rounded-full px-4 py-2 w-fit border border-white/5 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_yellow]"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_green]"></div>
                    <span className="text-[10px] text-gray-500 ml-3 font-orbitron font-black uppercase tracking-[0.3em]">Live_Research_Process</span>
                </div>

                <div className="space-y-6 font-mono text-xs md:text-sm text-left">
                    <div className="flex gap-4 items-center">
                        <span className="text-[#00d4ff] font-bold shrink-0">[PLANNER]</span>
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-gray-400">Determining 6 core pillars for Quantum Computing.</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-[#ff6b35] font-bold shrink-0">[SEARCH]</span>
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-gray-400">Scraping 48 academic nodes... validation (98.2%) complete.</span>
                    </div>
                    <div className="flex gap-4 items-center opacity-60">
                        <span className="text-purple-400 font-bold shrink-0">[RAG_UP]</span>
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-gray-500">Injecting neural context from 3 static PDF sources.</span>
                    </div>
                    <div className="flex gap-4 items-center relative">
                        <span className="text-green-400 font-bold shrink-0">[WRITER]</span>
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-white font-bold">Drafting Competitive Analysis... <span className="inline-block w-2 h-4 bg-[#00d4ff]" /></span>
                    </div>
                </div>
            </FuturisticCard>
        </div>
      </section>

      {/* Grid Specs */}
      <section id="features" className="py-40 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-xs font-black font-orbitron tracking-[0.6em] text-[#00d4ff] uppercase text-glow">CAPABILITIES</h2>
          <h3 className="text-4xl md:text-6xl font-black font-orbitron uppercase tracking-tighter">Why choose <span className="text-[#00d4ff]">Research.io?</span></h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
              <FuturisticCard glowColor="#00d4ff" className="text-center group">
                <div className="mb-8 p-4 bg-[#00d4ff]/10 rounded-2xl border border-[#00d4ff]/20 w-fit mx-auto group-hover:scale-110 transition-transform">
                    <Search className="text-[#00d4ff]" size={32} />
                </div>
                <h4 className="text-xl font-black font-orbitron uppercase mb-4">Smart Analysis</h4>
                <p className="text-gray-500 text-sm font-outfit leading-relaxed">
                  Our AI agents automatically find keywords, deep search the web, and organize data in real-time.
                </p>
              </FuturisticCard>
          </div>

          <div>
              <FuturisticCard glowColor="#ff6b35" className="text-center group">
                <div className="mb-8 p-4 bg-[#ff6b35]/10 rounded-2xl border border-[#ff6b35]/20 w-fit mx-auto group-hover:scale-110 transition-transform">
                    <Shield className="text-[#ff6b35]" size={32} />
                </div>
                <h4 className="text-xl font-black font-orbitron uppercase mb-4">Verified Facts</h4>
                <p className="text-gray-500 text-sm font-outfit leading-relaxed">
                  Every claim comes with clear citations. No fake info. Only verified and cross-checked intelligence.
                </p>
              </FuturisticCard>
          </div>

          <div>
              <FuturisticCard glowColor="#8b5cf6" className="text-center group">
                <div className="mb-8 p-4 bg-[#8b5cf6]/10 rounded-2xl border border-[#8b5cf6]/20 w-fit mx-auto group-hover:scale-110 transition-transform">
                    <Zap className="text-[#8b5cf6]" size={32} />
                </div>
                <h4 className="text-xl font-black font-orbitron uppercase mb-4">Super Fast</h4>
                <p className="text-gray-500 text-sm font-outfit leading-relaxed">
                  Save dozens of hours. Turn 40 hours of research into 4 minutes of professional-grade reports.
                </p>
              </FuturisticCard>
          </div>
        </div>
      </section>

      {/* CTA Layer */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
            <FuturisticCard glowColor="#00d4ff" className="text-center py-24 space-y-12">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black font-orbitron uppercase tracking-tighter">Ready to start <span className="text-[#00d4ff]">researching?</span></h2>
                    <p className="text-gray-500 font-orbitron text-xs tracking-widest">JOIN THE FUTURE OF RESEARCH</p>
                </div>
                <Link href="/signup" className="btn-cyber py-5 px-16 text-xl mx-auto w-fit">
                    CREATE ACCOUNT
                </Link>
            </FuturisticCard>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center relative z-10">
        <p className="font-orbitron font-black text-[10px] text-gray-700 tracking-[0.8em] uppercase">
            © 2026 Research.io // Smart AI Assistant
        </p>
      </footer>
    </div>
  )
}

