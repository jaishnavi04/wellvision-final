import { useEffect, useRef } from 'react'
import { Mic, MicOff, Square, AlertCircle, ShieldCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import VoiceWaveform from './VoiceWaveform'
const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
const MicrophoneCapture = ({ permissionState,isRecording,audioDuration,audioBlob,error,analyser,onRequestPermission,onStart,onStop,onAnalyse,onReset,analysisStatus }) => {
  const blobUrlRef = useRef(null)
  useEffect(()=>{ if(audioBlob) blobUrlRef.current=URL.createObjectURL(audioBlob); return ()=>{ if(blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current) } },[audioBlob])
  if(permissionState==='idle'||permissionState==='requesting') return (
    <div className="card p-8 flex flex-col items-center text-center gap-5">
      <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50"><ShieldCheck size={28} className="text-brand-500"/></span>
      <div><h3 className="font-display font-bold text-gray-900 text-lg mb-1">Microphone Access Required</h3><p className="text-sm text-gray-500 max-w-xs">WellVision needs your microphone to analyse voice patterns. No audio is stored.</p></div>
      <Button onClick={onRequestPermission} loading={permissionState==='requesting'} size="lg" className="gap-2"><Mic size={17}/> Allow Microphone</Button>
    </div>
  )
  if(permissionState==='denied'||permissionState==='unsupported') return (
    <div className="card p-6 flex items-start gap-4">
      <AlertCircle size={22} className="text-red-500 flex-shrink-0 mt-0.5"/>
      <div><p className="font-semibold text-gray-900 text-sm mb-1">Microphone Unavailable</p><p className="text-sm text-gray-500">{error}</p><button onClick={onRequestPermission} className="mt-3 text-sm text-brand-600 font-medium hover:underline">Try again</button></div>
    </div>
  )
  const isAnalysing=analysisStatus==='uploading'||analysisStatus==='analysing'
  return (
    <div className="space-y-4">
      <VoiceWaveform analyser={analyser} isRecording={isRecording} height={80}/>
      {isRecording&&(<div className="flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/><span className="font-mono text-sm font-semibold text-gray-700">{fmt(audioDuration)}</span><span className="text-xs text-gray-400">Recording...</span></div>)}
      <div className="flex gap-3">
        {!isRecording&&!audioBlob&&<Button onClick={onStart} fullWidth size="lg" className="gap-2"><Mic size={18}/> Start Recording</Button>}
        {isRecording&&<Button onClick={onStop} fullWidth size="lg" variant="danger" className="gap-2"><Square size={16} fill="white"/> Stop Recording</Button>}
        {audioBlob&&!isRecording&&<><Button onClick={()=>onAnalyse(audioBlob)} fullWidth size="lg" loading={isAnalysing} className="gap-2"><Mic size={17}/>{isAnalysing?'Analysing...':'Analyse Recording'}</Button><Button variant="secondary" onClick={onReset} size="lg">Redo</Button></>}
      </div>
      {audioBlob&&!isRecording&&blobUrlRef.current&&(<div><p className="text-xs text-gray-400 mb-1.5">Preview · {audioDuration}s recorded</p><audio src={blobUrlRef.current} controls className="w-full h-9 rounded-xl"/></div>)}
      {error&&<p className="text-xs text-red-500 flex items-center gap-1.5"><AlertCircle size={13}/>{error}</p>}
    </div>
  )
}
export default MicrophoneCapture
