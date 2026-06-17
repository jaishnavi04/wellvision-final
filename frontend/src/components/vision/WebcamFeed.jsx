import { forwardRef } from 'react'
import { Camera, CameraOff, ShieldCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
const col=(s,g=70,w=45)=>s>=g?'#1d9e75':s>=w?'#f59e0b':'#ef4444'
const WebcamFeed = forwardRef(({ videoRef,canvasRef,permissionState,isStreaming,sessionState,liveMetrics,error,onRequestCamera },_ref)=>{
  if(permissionState==='idle'||permissionState==='requesting') return (
    <div className="w-full aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center gap-4 border border-gray-800">
      <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20"><ShieldCheck size={28} className="text-blue-400"/></span>
      <div className="text-center px-6"><p className="text-white font-semibold mb-1">Camera Access Required</p><p className="text-gray-400 text-sm">WellVision needs your camera for posture and eye tracking.</p></div>
      <Button onClick={onRequestCamera} loading={permissionState==='requesting'} className="gap-2"><Camera size={16}/> Allow Camera</Button>
    </div>
  )
  if(permissionState==='denied'||permissionState==='unsupported') return (
    <div className="w-full aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center gap-3 border border-red-900/40">
      <CameraOff size={28} className="text-red-400"/>
      <p className="text-white font-semibold text-sm">Camera Unavailable</p>
      <p className="text-gray-400 text-xs text-center px-6 max-w-xs">{error}</p>
      <Button variant="secondary" onClick={onRequestCamera} size="sm">Try again</Button>
    </div>
  )
  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{transform:'scaleX(-1)'}}/>
      <canvas ref={canvasRef} className="hidden"/>
      {sessionState==='active'&&liveMetrics&&(
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${liveMetrics.face_detected?'bg-brand-400 animate-pulse':'bg-gray-500'}`}/>
            <span className="text-xs font-medium text-white/80 bg-black/40 px-2 py-0.5 rounded-full">{liveMetrics.face_detected?'Face Detected':'No Face'}</span>
          </div>
          {liveMetrics.eye&&(<div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center"><p className="text-xs text-white/60">EAR</p><p className="text-sm font-bold text-white">{liveMetrics.eye.ear.toFixed(3)}</p></div>)}
          {liveMetrics.posture&&(<div className="absolute bottom-3 left-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2"><div className="flex items-center justify-between mb-1"><span className="text-xs text-white/70">Posture</span><span className="text-xs font-bold text-white">{liveMetrics.posture.posture_score.toFixed(0)}%</span></div><div className="h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-300" style={{width:`${liveMetrics.posture.posture_score}%`,backgroundColor:col(liveMetrics.posture.posture_score)}}/></div></div>)}
          {liveMetrics.drowsiness?.is_yawning&&(<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><div className="bg-amber-500/90 text-white px-4 py-2 rounded-xl text-sm font-bold animate-pulse">Yawning</div></div>)}
        </div>
      )}
      {sessionState==='active'&&(<div className="absolute top-3 left-1/2 -translate-x-1/2"><span className="flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>LIVE</span></div>)}
      {sessionState==='connecting'&&(<div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="text-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"/><p className="text-white text-sm">Connecting...</p></div></div>)}
    </div>
  )
})
WebcamFeed.displayName='WebcamFeed'
export default WebcamFeed
