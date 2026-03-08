"use client"
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import api, { setAuthToken } from '@/lib/api'
import Link from 'next/link'

export default function HistoryPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const token = await getToken()
      if (token) setAuthToken(token)
      const res = await api.get('/users/me/history')
      return res.data
    },
    enabled: isLoaded && isSignedIn,
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-3xl font-bold mb-8">Research History</h1>
      <div className="flex gap-4 mb-8">
        <input type="text" placeholder="Search topics..." className="bg-[#1A1F2E] border border-[#ffffff20] rounded-lg p-3 text-white focus:outline-none flex-1" />
        <select className="bg-[#1A1F2E] border border-[#ffffff20] rounded-lg p-3 text-white">
            <option>All Statuses</option>
            <option>Completed</option>
            <option>In Progress</option>
            <option>Failed</option>
        </select>
      </div>

      {isLoading ? <p>Loading history...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data?.length === 0 ? (
            <div className="col-span-2 text-center py-20 bg-[#080B14] rounded-2xl border border-[#ffffff10]">
              <p className="text-gray-500 mb-4">No research yet.</p>
              <Link href="/research/new" className="text-[#00d4ff] hover:underline">Start your first research!</Link>
            </div>
          ) : (
            data?.map((session: any) => (
              <div key={session.id} className="bg-[#080B14] p-6 rounded-2xl border border-[#ffffff10] flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{session.topic}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${session.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {session.status}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mb-6">Created: {new Date(session.created_at).toLocaleDateString()}</p>
                
                <div className="mt-auto flex gap-3 pt-4 border-t border-[#ffffff10]">
                    <Link href={`/research/${session.id}`} className="bg-[#1A1F2E] hover:bg-[#ffffff10] px-4 py-2 rounded-lg text-sm text-center flex-1 transition-colors">
                        View Details
                    </Link>
                    {session.status === 'completed' && (
                        <button className="bg-[#1A1F2E] hover:bg-[#ffffff10] px-4 py-2 rounded-lg text-sm text-center flex-1 transition-colors">
                            Download PDF
                        </button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
