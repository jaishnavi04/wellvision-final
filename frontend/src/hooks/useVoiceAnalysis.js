import { useState, useCallback } from 'react'
import { analyzeVoice } from '@/services/voiceService'
export const useVoiceAnalysis = () => {
  const [status,  setStatus]   = useState('idle')
  const [result,  setResult]   = useState(null)
  const [error,   setError]    = useState(null)
  const [progress, setProgress] = useState(0)
  const analyse = useCallback(async (audioBlob) => {
    if (!audioBlob) return
    setStatus('uploading'); setError(null); setProgress(30)
    try {
      setStatus('analysing'); const data = await analyzeVoice(audioBlob)
      setProgress(100); setResult(data); setStatus('done')
    } catch (err) { setError(err.message ?? 'Analysis failed.'); setStatus('error') }
    finally { setProgress(0) }
  }, [])
  const reset = useCallback(() => { setStatus('idle'); setResult(null); setError(null); setProgress(0) }, [])
  return { status, result, error, progress, analyse, reset }
}
