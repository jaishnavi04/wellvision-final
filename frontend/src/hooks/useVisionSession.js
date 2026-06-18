import { useState, useRef, useCallback, useEffect } from 'react'
import { createVisionSocket } from '@/services/visionService'
const FRAME_INTERVAL_MS = 200
export const useVisionSession = (captureFrame) => {
  const [sessionState,  setSessionState]  = useState('idle')
  const [liveMetrics,   setLiveMetrics]   = useState(null)
  const [summary,       setSummary]       = useState(null)
  const [alerts,        setAlerts]        = useState([])
  const [error,         setError]         = useState(null)
  const [frameCount,    setFrameCount]    = useState(0)
  const socketRef   = useRef(null)
  const intervalRef = useRef(null)
  const frameNumRef = useRef(0)
  const alertTimerRef = useRef(null)
  const clearSession = () => { if(intervalRef.current){clearInterval(intervalRef.current);intervalRef.current=null}; socketRef.current?.close(); socketRef.current=null; frameNumRef.current=0 }
  useEffect(()=>()=>clearSession(),[])
  const addAlert = useCallback((msg) => {
    if(!msg) return
    setAlerts(prev=>{ if(prev[0]===msg) return prev; return [msg,...prev].slice(0,5) })
    if(alertTimerRef.current) clearTimeout(alertTimerRef.current)
    alertTimerRef.current = setTimeout(()=>setAlerts([]),5000)
  },[])
  const startSession = useCallback(async () => {
    setSessionState('connecting'); setError(null); setSummary(null); setLiveMetrics(null); setAlerts([])
    const socket = createVisionSocket(
      (data) => {
        if(data.type==='auth_ok'){
          setSessionState('active')
          intervalRef.current = setInterval(()=>{ const frame=captureFrame(0.65); if(frame){frameNumRef.current++;setFrameCount(frameNumRef.current);socket.sendFrame(frame,frameNumRef.current)} },FRAME_INTERVAL_MS)
          return
        }
        if(data.type==='summary'){setSessionState('summary');setSummary(data);clearInterval(intervalRef.current);return}
        if(data.type==='error'){setError(data.message);setSessionState('error');clearSession();return}
        setLiveMetrics(data)
        if(data.drowsiness?.alert_message) addAlert(data.drowsiness.alert_message)
        if(data.posture?.alert_message)    addAlert(data.posture.alert_message)
      },
      ()=>{setError('Connection failed.');setSessionState('error');clearSession()},
      ()=>{if(sessionState==='active')setSessionState('idle')}
    )
    socketRef.current = socket
  },[captureFrame,addAlert])
  const stopSession  = useCallback(()=>{setSessionState('stopping');socketRef.current?.stop();clearInterval(intervalRef.current);intervalRef.current=null},[])
  const resetSession = useCallback(()=>{clearSession();setSessionState('idle');setLiveMetrics(null);setSummary(null);setAlerts([]);setError(null);setFrameCount(0)},[])
  return { sessionState, liveMetrics, summary, alerts, error, frameCount, startSession, stopSession, resetSession }
}
