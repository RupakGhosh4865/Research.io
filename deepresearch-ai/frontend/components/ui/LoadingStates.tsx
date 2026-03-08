import React from 'react'

export function ReportSkeleton() {
  return (
    <div className="bg-[#1A1F2E] border border-[#ffffff10] rounded-xl h-full p-8 overflow-y-auto animate-pulse">
      <div className="h-10 bg-[#ffffff10] rounded w-1/3 mb-8"></div>
      <div className="space-y-4">
        <div className="h-4 bg-[#ffffff10] rounded w-full"></div>
        <div className="h-4 bg-[#ffffff10] rounded w-5/6"></div>
        <div className="h-4 bg-[#ffffff10] rounded w-4/6"></div>
      </div>
      <div className="h-6 bg-[#ffffff10] rounded w-1/4 mt-12 mb-6"></div>
      <div className="space-y-4">
        <div className="h-4 bg-[#ffffff10] rounded w-full"></div>
        <div className="h-4 bg-[#ffffff10] rounded w-full"></div>
        <div className="h-4 bg-[#ffffff10] rounded w-3/4"></div>
      </div>
    </div>
  )
}

export function AgentFeedSkeleton() {
  return (
    <div className="bg-[#0A0D18] border border-[#ffffff10] rounded-xl h-full flex flex-col overflow-hidden">
      <div className="bg-[#1A1F2E] p-3 border-b border-[#ffffff10] flex gap-2 items-center">
        <div className="w-24 h-4 bg-[#ffffff10] rounded animate-pulse"></div>
      </div>
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="w-4 h-4 rounded-full bg-[#ffffff10] animate-pulse mt-1"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-[#ffffff10] rounded w-1/4 animate-pulse"></div>
              <div className="h-3 bg-[#ffffff10] rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-[#080B14] p-6 rounded-2xl border border-[#ffffff10] animate-pulse">
      <div className="h-4 bg-[#ffffff10] rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-[#ffffff10] rounded w-1/4"></div>
    </div>
  )
}
