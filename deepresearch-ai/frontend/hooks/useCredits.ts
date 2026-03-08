import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import api, { setAuthToken } from '@/lib/api'

export function useCredits() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const token = await getToken()
      if (token) setAuthToken(token)
      const res = await api.get('/users/me')
      return res.data.credits_remaining
    },
    enabled: isLoaded && isSignedIn,
    refetchOnWindowFocus: true
  })

  return {
    credits: data || 0,
    isLoading,
    refetch,
    hasSufficientCredits: (cost: number) => (data || 0) >= cost
  }
}
