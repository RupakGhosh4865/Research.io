"use client"
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useCredits } from '@/hooks/useCredits'
import { useEffect } from 'react'

export default function SuccessPage() {
  const { refetch } = useCredits()
  
  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <CheckCircle size={80} className="text-green-500 mb-6" />
      <h1 className="text-4xl font-syne font-bold mb-4">Payment Successful!</h1>
      <p className="text-xl text-gray-400 mb-8 max-w-md">Your credits have been added to your account. You can now continue your research.</p>
      <Link href="/research/new" className="bg-[#00d4ff] text-black px-8 py-4 rounded-full font-bold hover:bg-[#00badd] transition-colors">
        Start Your Research Now
      </Link>
    </div>
  )
}
