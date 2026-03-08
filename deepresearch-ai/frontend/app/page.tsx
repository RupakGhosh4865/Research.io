import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050810] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 text-center max-w-6xl mx-auto flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] -z-10 opacity-20"></div>
        <h1 className="font-syne text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Research Anything. <span className="text-[#00d4ff]">In Minutes.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-10">
          5 specialized AI agents collaborate to deliver publishable research reports. 
          Powered by GPT-4o, LangGraph, and real-time web search.
        </p>
        <div className="flex gap-4 mb-20">
          <Link href="/sign-up" className="bg-[#ff6b35] hover:bg-[#e05a27] text-white px-8 py-4 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,107,53,0.4)]">
            Start Researching Free
          </Link>
          <a href="#demo" className="bg-[#1A1F2E] hover:bg-[#2A2F3E] text-white border border-[#2A2F3E] px-8 py-4 rounded-full font-bold transition-all">
            See Live Demo
          </a>
        </div>
        
        {/* Mock Agent Feed */}
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md border border-[#ffffff10] rounded-xl p-6 text-left font-mono text-sm shadow-2xl">
          <div className="flex items-center gap-2 mb-4 border-b border-[#ffffff10] pb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-gray-500 text-xs">agent-feed.log</span>
          </div>
          <div className="space-y-3">
            <div className="text-[#00d4ff] flex gap-2"><span>[Planner]</span> <span className="text-gray-300">Breaking down your topic into 6 sub-questions...</span></div>
            <div className="text-[#ff6b35] flex gap-2"><span>[Search]</span> <span className="text-gray-300">Found 24 highly relevant academic sources.</span></div>
            <div className="text-purple-400 flex gap-2"><span>[RAG]</span> <span className="text-gray-300">Extracting context from uploaded documents.</span></div>
            <div className="text-green-400 flex gap-2 animate-pulse"><span>[Writer]</span> <span className="text-white">Drafting Introduction section...</span></div>
          </div>
        </div>
      </section>
      
      {/* Rest of the landing page sections would go here... (How it Works, Features, Pricing) */}
    </div>
  )
}
