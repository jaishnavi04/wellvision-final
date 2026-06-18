import { Activity, Mic, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useMicrophone }   from '@/hooks/useMicrophone'
import { useVoiceAnalysis } from '@/hooks/useVoiceAnalysis'
import { useAuth }         from '@/context/AuthContext'
import { saveVoiceSession } from '@/services/wellnessService'
import MicrophoneCapture   from '@/components/voice/MicrophoneCapture'
import VoiceResults        from '@/components/voice/VoiceResults'
const STEPS = ['Record','Analyse','Results']
const VoiceSessionPage = () => {
  const { currentUser } = useAuth()
  const mic = useMicrophone()
  const va  = useVoiceAnalysis()
  useEffect(()=>{ if(va.status==='done'&&va.result&&currentUser) saveVoiceSession(currentUser.uid,va.result).catch(console.error) },[va.status,va.result,currentUser])
  const handleReset = () => { mic.resetRecording(); va.reset() }
  const currentStep = va.status==='done'?2:(mic.audioBlob||mic.isRecording)?1:0
  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-gray-100 transition-colors"><ChevronLeft size={18} className="text-gray-600"/></Link>
        <span className="flex items-center justify-center w-8 h-8 bg-brand-500 rounded-xl"><Activity size={16} className="text-white"/></span>
        <div><p className="text-sm font-semibold text-gray-900 leading-none">Voice Session</p><p className="text-xs text-gray-400">Stress · Emotion · Energy</p></div>
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
      <main className="max-w-xl mx-auto px-5 py-8">
        {va.status==='idle'&&!mic.audioBlob&&!mic.isRecording&&(
          <div className="card p-5 mb-5 flex items-start gap-3">
            <Mic size={18} className="text-brand-500 flex-shrink-0 mt-0.5"/>
            <div><p className="text-sm font-semibold text-gray-800 mb-1">How it works</p><p className="text-sm text-gray-500">Record yourself speaking for 15-60 seconds. WellVision transcribes your speech and detects stress, emotion, and energy via Whisper + Librosa.</p></div>
          </div>
        )}
        {(va.status==='uploading'||va.status==='analysing')&&(
          <div className="card p-5 mb-5">
            <p className="text-sm font-semibold text-gray-800 mb-3">{va.status==='uploading'?'Uploading audio...':'Analysing with Whisper + Librosa...'}</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{width:`${va.progress||60}%`}}/></div>
            <p className="text-xs text-gray-400 mt-2">First analysis may take 30-60s while the AI model loads.</p>
          </div>
        )}
        {va.status==='error'&&(<div className="card p-4 mb-5 border-red-100 bg-red-50"><p className="text-sm font-semibold text-red-700 mb-1">Analysis failed</p><p className="text-xs text-red-600">{va.error}</p><button onClick={handleReset} className="mt-2 text-xs text-red-700 font-medium underline">Try again</button></div>)}
        {va.status!=='done'?(<MicrophoneCapture permissionState={mic.permissionState} isRecording={mic.isRecording} audioDuration={mic.audioDuration} audioBlob={mic.audioBlob} error={mic.error} analyser={mic.analyser} onRequestPermission={mic.requestPermission} onStart={mic.startRecording} onStop={mic.stopRecording} onAnalyse={va.analyse} onReset={handleReset} analysisStatus={va.status}/>):(<VoiceResults result={va.result} onReset={handleReset}/>)}
      </main>
    </div>
  )
}
export default VoiceSessionPage
