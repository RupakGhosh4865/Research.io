"use client"
import ReportViewer from '@/components/research/ReportViewer'
import Link from 'next/link'

export default function PublicReportPage({ params }: { params: { token: string } }) {
  // Normally fetch report by share_token
  return (
    <div className="min-h-screen bg-[#050810] text-gray-100 flex flex-col">
      <div className="bg-[#080B14] border-b border-[#ffffff10] p-4 text-center">
        <p className="text-sm text-gray-400">
          Shared via <span className="text-[#00d4ff] font-bold">DeepResearch AI</span> — 
          <Link href="/signup" className="ml-2 underline text-white hover:text-[#00d4ff] transition-colors">Create your own free report</Link>
        </p>
      </div>
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        <ReportViewer />
      </div>
    </div>
  )
}
