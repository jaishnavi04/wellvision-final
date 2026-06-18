import { Camera, ChevronLeft, Play, Square, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useWebcam }        from '@/hooks/useWebcam'
import { useVisionSession } from '@/hooks/useVisionSession'
import { useAuth }          from '@/context/AuthContext'
import { saveVisionSession } from '@/services/wellnessService'
import WebcamFeed           from '@/components/vision/WebcamFeed'
import VisionMetrics        from '@/components/vision/VisionMetrics'
import VisionResults        from '@/components/vision/VisionResults'
import PostureAlert         from '@/components/vision/PostureAlert'
import Button               from '@/components/ui/Button'
const STEPS=['Camera','Session','Results']
const VisionSessionPage = () => {
  const { currentUser } = useAuth()
  const webcam  = useWebcam()
  const session = useVisionSession(webcam.captureFrame)
  useEffect(()=>{ if(session.sessionState==='summary'&&session.summary&&currentUser) saveVisionSession(currentUser.uid,session.summary).catch(console.error) },[session.sessionState,session.summary,currentUser])
  const handleStart = async () => { if(webcam.permissionState!=='granted') { const ok=await webcam.requestCamera(); if(!ok) return }; await session.startSession() }
  const handleReset = () => { session.resetSession(); webcam.stopStream() }
  const currentStep = session.sessionState==='summary'?2:session.sessionState==='active'||session.sessionState==='stopping'?1:webcam.isStreaming?1:0
  const isActive=session.sessionState==='active', isSummary=session.sessionState==='summary', isLoading=session.sessionState==='connecting'||session.sessionState==='stopping'
  return (
    <div className="min-h-screen bg-surface-secondary">
      <PostureAlert alerts={session.alerts}/>
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-gray-100 transition-colors"><ChevronLeft size={18} className="text-gray-600"/></Link>
        <span className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-xl"><Camera size={16} className="text-white"/></span>
        <div><p className="text-sm font-semibold text-gray-900 leading-none">Vision Session</p><p className="text-xs text-gray-400">Eye fatigue · Posture · Drowsiness</p></div>
      </header>
      <div className="flex items-center justify-center gap-2 py-4 bg-white border-b border-gray-100">
        {STEPS.map((label,i)=>(
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${i<currentStep?'bg-brand-500 text-white':i===currentStep?'bg-brand-500 text-white ring-4 ring-brand-100':'bg-gray-100 text-gray-400'}`}>{i<currentStep?'✓':i+1}</div>
            <span className={`text-xs font-medium ${i===currentStep?'text-brand-600':'text-gray-400'}`}>{label}</span>
            {i<STEPS.length-1&&<div className={`w-8 h-px ${i<currentStep?'bg-brand-400':'bg-gray-200'}`}/>}
          </div>
        ))}
      </div>
      <main className="max-w-5xl mx-auto px-5 py-6">
        {isSummary?(<div className="max-w-xl mx-auto"><VisionResults summary={session.summary} onReset={handleReset}/></div>):(
          <div className="grid lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 space-y-4">
              <WebcamFeed videoRef={webcam.videoRef} canvasRef={webcam.canvasRef} permissionState={webcam.permissionState} isStreaming={webcam.isStreaming} sessionState={session.sessionState} liveMetrics={session.liveMetrics} error={webcam.error} onRequestCamera={webcam.requestCamera}/>
              <div className="flex gap-3">
                {!isActive&&!isLoading&&(<Button onClick={handleStart} fullWidth size="lg" loading={isLoading} className="gap-2" disabled={webcam.permissionState==='denied'}><Play size={17}/> Start Session</Button>)}
                {isActive&&(<Button onClick={session.stopSession} fullWidth size="lg" variant="danger" className="gap-2"><Square size={16} fill="white"/> Stop & Get Results</Button>)}
                {isLoading&&(<Button fullWidth size="lg" loading={true}>{session.sessionState==='connecting'?'Connecting...':'Processing...'}</Button>)}
              </div>
              {session.sessionState==='error'&&(<div className="card p-4 bg-red-50 border-red-100"><p className="text-sm font-semibold text-red-700 mb-1">Connection Error</p><p className="text-xs text-red-600 mb-2">{session.error}</p><button onClick={handleReset} className="text-xs text-red-700 font-medium underline">Reset</button></div>)}
              {!isActive&&session.sessionState==='idle'&&(<div className="card p-4 flex items-start gap-3"><Activity size={16} className="text-blue-500 flex-shrink-0 mt-0.5"/><div><p className="text-sm font-semibold text-gray-800 mb-1">How it works</p><p className="text-sm text-gray-500">Frames are sent to the backend at 5fps. MediaPipe detects 468 face + 33 pose landmarks. EAR, PERCLOS, neck angle and shoulder alignment update every 200ms via WebSocket.</p></div></div>)}
            </div>
            <div className="lg:col-span-2"><VisionMetrics liveMetrics={session.liveMetrics} frameCount={session.frameCount} sessionState={session.sessionState}/></div>
          </div>
        )}
      </main>
    </div>
  )
}
export default VisionSessionPage
