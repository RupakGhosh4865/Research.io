// Placeholder Report Viewer Component
export default function ReportViewer() {
  return (
    <div className="bg-[#1A1F2E] border border-[#ffffff10] rounded-xl h-full p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 pb-4 border-b border-[#ffffff10]">Research Report</h1>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-400 italic">Report content will be streamed here by the Writer agent...</p>
      </div>
    </div>
  )
}
