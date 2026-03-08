export default function Dashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-syne font-bold mb-8">Welcome back</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#080B14] p-6 rounded-2xl border border-[#ffffff10]">
          <h3 className="text-gray-400 mb-2">Available Credits</h3>
          <p className="text-4xl font-bold text-[#00d4ff]">3</p>
          <a href="#" className="text-sm text-[#ff6b35] mt-4 inline-block hover:underline">Buy more credits &rarr;</a>
        </div>
        <div className="bg-[#080B14] p-6 rounded-2xl border border-[#ffffff10]">
          <h3 className="text-gray-400 mb-2">Total Reports</h3>
          <p className="text-4xl font-bold">12</p>
        </div>
        <div className="bg-[#080B14] p-6 rounded-2xl border border-[#ffffff10]">
          <h3 className="text-gray-400 mb-2">Avg Quality Score</h3>
          <p className="text-4xl font-bold text-green-400">8.4<span className="text-lg text-gray-500">/10</span></p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Recent Research</h2>
        <a href="/research/new" className="bg-[#00d4ff] text-black px-6 py-2 rounded-full font-bold hover:bg-[#00badd] transition-colors">Start New Research</a>
      </div>
      
      <div className="bg-[#080B14] rounded-2xl border border-[#ffffff10] overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No recent research found. Start a new one!
        </div>
      </div>
    </div>
  )
}
