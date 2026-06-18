import { useState, useCallback } from 'react'
import { fetchRecommendations } from '@/services/wellnessService'
export const useRecommendations = () => {
  const [recs,    setRecs]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const load = useCallback(async (metrics) => {
    setLoading(true); setError(null)
    try { const data = await fetchRecommendations(metrics); setRecs(data) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  },[])
  return { recs, loading, error, load }
}
