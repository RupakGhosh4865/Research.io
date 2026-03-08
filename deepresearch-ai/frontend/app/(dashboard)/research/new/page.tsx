import ResearchForm from '@/components/research/ResearchForm'

export default function NewResearchPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-gray-400 text-sm mb-2">Dashboard &gt; New Research</p>
        <h1 className="text-3xl font-syne font-bold">Start New Research</h1>
      </div>
      <ResearchForm />
    </div>
  )
}
