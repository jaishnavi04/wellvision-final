import { CheckCircle2, RefreshCw, Clock, Eye, User, Brain } from 'lucide-react'
import Button from '@/components/ui/Button'
const lc=(label)=>{ const l=(label??'').toLowerCase(); if(l.includes('poor')||l.includes('high')||l.includes('drowsy')||l.includes('severe')) return 'text-red-600'; if(l.includes('fair')||l.includes('moderate')) return 'text-amber-600'; return 'text-brand-600' }
const VisionResults = ({ summary, onReset }) => {
  if(!summary) return null
  const mins=Math.floor(summary.duration_seconds/60), secs=Math.round(summary.duration_seconds%60)
  const duration=mins>0?`${mins}m ${secs}s`:`${secs}s`
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50"><CheckCircle2 size={22} className="text-brand-500"/></span>
          <div><p className="font-display font-bold text-gray-900">Session Complete</p><p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11}/>{duration} · {summary.total_frames} frames</p></div>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
          {[{l:'Avg Posture',v:`${summary.avg_posture_score.toFixed(0)}%`,lbl:summary.posture_label},{l:'Eye Fatigue',v:summary.fatigue_label,lbl:''},{l:'Drowsiness',v:summary.drowsiness_label,lbl:''}].map(({l,v,lbl})=>(
            <div key={l} className="text-center"><p className={`text-2xl font-display font-bold ${lc(v)}`}>{v}</p><p className="text-xs text-gray-400 mt-0.5">{l}</p></div>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Session Stats</p>
        <div className="space-y-3">
          {[{icon:Eye,l:'Average EAR',v:summary.avg_ear.toFixed(3)},{icon:Eye,l:'Avg Blink Rate',v:`${summary.avg_blink_rate.toFixed(1)}/min`},{icon:User,l:'Avg Posture Score',v:`${summary.avg_posture_score.toFixed(1)}%`},{icon:Brain,l:'Avg Drowsiness',v:`${summary.avg_drowsiness_score.toFixed(1)}%`},{icon:Brain,l:'Total Yawns',v:String(summary.total_yawns)}].map(({icon:Icon,l,v})=>(
            <div key={l} className="flex items-center justify-between py-1 border-b border-gray-50">
              <div className="flex items-center gap-2"><Icon size={14} className="text-gray-400"/><span className="text-sm text-gray-600">{l}</span></div>
              <span className="text-sm font-semibold text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5 border-l-4 border-brand-400">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Recommendations</p>
        <ul className="space-y-2">
          {summary.recommendations.map((rec,i)=>(
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><CheckCircle2 size={14} className="text-brand-500 flex-shrink-0 mt-0.5"/>{rec}</li>
          ))}
        </ul>
      </div>
      <Button variant="secondary" fullWidth onClick={onReset} className="gap-2"><RefreshCw size={15}/> Start New Session</Button>
    </div>
  )
}
export default VisionResults
