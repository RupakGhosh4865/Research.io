"use client"
import AgentFeed from '@/components/research/AgentFeed'
import ReportViewer from '@/components/research/ReportViewer'

export default function ResearchViewPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-full flex flex-col p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-syne text-2xl font-bold">Research Session</h1>
        <div className="bg-[#1A1F2E] px-3 py-1 rounded-full text-xs text-gray-400 border border-[#ffffff10]">
          ID: {params.id.split('-')[0]}...
        </div>
      </div>
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="w-full lg:w-[45%] h-full flex flex-col relative z-20">
            <AgentFeed 
              sessionId={params.id} 
              onCompleted={(reportId) => console.log('Completed', reportId)} 
            />
        </div>
        <div className="w-full lg:flex-1 h-full flex flex-col">
            <ReportViewer />
        </div>
      </div>
    </div>
  )
}
