"use client"
import { useEffect, useState } from 'react'
import AgentFeed from '@/components/research/AgentFeed'
import ReportViewer from '@/components/research/ReportViewer'
import { getSessionStatus } from '../../../../lib/api'

export default function ResearchViewPage({ params }: { params: { id: string } }) {
  const [reportId, setReportId] = useState<string | undefined>()

  useEffect(() => {
    // Check if report already exists on mount
    getSessionStatus(params.id).then(data => {
      if (data.report_id) {
        setReportId(data.report_id)
      }
    }).catch(console.error)
  }, [params.id])

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
            isCompleted={!!reportId}
            onCompleted={(id) => setReportId(id)}
          />
        </div>
        <div className="w-full lg:flex-1 h-full flex flex-col">
          <ReportViewer reportId={reportId} />
        </div>
      </div>
    </div>
  )
}
