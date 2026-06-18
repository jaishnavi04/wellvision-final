import { useState, useEffect } from 'react'
import { subscribeToSessions, buildChartData } from '@/services/wellnessService'
import { useAuth } from '@/context/AuthContext'
const computeStats = (sessions) => {
  if(!sessions.length) return null
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0
  const wellness = sessions.map(s=>s.wellnessScore).filter(Boolean)
  const stress   = sessions.map(s=>s.voiceData?.stressScore).filter(Boolean)
  const posture  = sessions.map(s=>s.visionData?.postureScore).filter(Boolean)
  const emotions = sessions.map(s=>s.voiceData?.emotion).filter(Boolean)
  const dominant = emotions.length ? Object.entries(emotions.reduce((acc,e)=>({...acc,[e]:(acc[e]||0)+1}),{})).sort((a,b)=>b[1]-a[1])[0][0] : 'neutral'
  return { avgWellness:Math.round(avg(wellness)), avgStress:Math.round(avg(stress)), avgPosture:Math.round(avg(posture)), totalSessions:sessions.length, dominantMood:dominant, lastSession:sessions[0]??null }
}
export const useWellnessData = () => {
  const { currentUser } = useAuth()
  const [sessions,  setSessions]  = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [stats,     setStats]     = useState(null)
  useEffect(() => {
    if(!currentUser) return
    setLoading(true)
    const unsub = subscribeToSessions(currentUser.uid, (data) => { setSessions(data); setChartData(buildChartData(data)); setStats(computeStats(data)); setLoading(false) })
    return unsub
  },[currentUser])
  return { sessions, chartData, stats, loading }
}
