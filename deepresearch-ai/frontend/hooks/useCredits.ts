import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/context/AuthContext'
import api, { setAuthToken } from '../lib/api'

export function useCredits() {
  const { token, user, isLoading: authLoading } = useAuthContext()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      if (token) setAuthToken(token)
      const res = await api.get('/users/me')
      return res.data.credits_remaining
    },
    enabled: !authLoading && !!user,
    refetchOnWindowFocus: true
  })

  return {
    credits: data || user?.credits_remaining || 0,
    isLoading: isLoading || authLoading,
    refetch,
    hasSufficientCredits: (cost: number) => (data || user?.credits_remaining || 0) >= cost
  }
}
