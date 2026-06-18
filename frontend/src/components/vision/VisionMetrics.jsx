import { Eye, Brain, Activity, User } from 'lucide-react'
const MetricCard = ({ icon:Icon, label, value, sub, color, alert=false }) => (
  <div className={`card p-4 ${alert?'border-amber-200 bg-amber-50':''}`}>
    <div className="flex items-center gap-2 mb-2"><Icon size={15} className={alert?'text-amber-500':'text-gray-400'}/><p className="text-xs font-medium text-gray-500">{label}</p></div>
    <p className={`text-2xl font-display font-bold mb-0.5 ${color}`}>{value}</p>
    {sub&&<p className="text-xs text-gray-400">{sub}</p>}
  </div>
)
const ScoreBar = ({ label, value, max=100, colorClass='bg-brand-500' }) => (
  <div><div className="flex justify-between mb-1"><span className="text-xs text-gray-500">{label}</span><span className="text-xs font-semibold text-gray-700">{typeof value==='number'?value.toFixed(1):'—'}</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-300 ${colorClass}`} style={{width:`${Math.min((value/max)*100,100)}%`}}/></div></div>
)
const VisionMetrics = ({ liveMetrics, frameCount, sessionState }) => {
  if(!liveMetrics&&sessionState!=='active') return (
    <div className="grid grid-cols-2 gap-3">
      {['Eye Fatigue','Blink Rate','Posture','Drowsiness'].map(l=>(
        <div key={l} className="card p-4 opacity-50"><p className="text-xs text-gray-400 mb-2">{l}</p><p className="text-2xl font-display font-bold text-gray-300">—</p></div>
      ))}
    </div>
  )
  const eye=liveMetrics?.eye, posture=liveMetrics?.posture, drowsy=liveMetrics?.drowsiness
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Eye}    label="Eye Fatigue" value={eye?`${eye.fatigue_score.toFixed(0)}%`:'—'} sub={eye?.fatigue_label} color={!eye?'text-gray-400':eye.fatigue_score>=60?'text-red-600':eye.fatigue_score>=35?'text-amber-600':'text-brand-600'} alert={eye?.fatigue_score>=60}/>
        <MetricCard icon={Activity} label="Blink Rate"  value={eye?`${eye.blink_rate}/m`:'—'} sub={eye?(eye.blink_rate<12?'Low':'Normal'):''} color={eye?.blink_rate<12?'text-amber-600':'text-blue-600'}/>
        <MetricCard icon={User}   label="Posture"     value={posture?`${posture.posture_score.toFixed(0)}%`:'—'} sub={posture?.posture_label} color={!posture?'text-gray-400':posture.posture_score>=80?'text-brand-600':posture.posture_score>=55?'text-amber-600':'text-red-600'} alert={posture?.posture_score<55}/>
        <MetricCard icon={Brain}  label="Drowsiness"  value={drowsy?`${drowsy.drowsiness_score.toFixed(0)}%`:'—'} sub={drowsy?.drowsiness_label} color={!drowsy?'text-gray-400':drowsy.drowsiness_score>=70?'text-red-600':drowsy.drowsiness_score>=45?'text-amber-600':'text-brand-600'} alert={drowsy?.drowsiness_score>=45}/>
      </div>
      {liveMetrics&&(
        <div className="card p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detail</p>
          {eye&&<><ScoreBar label={`EAR — ${eye.is_closed?'CLOSED':'Open'}`} value={eye.ear*100} max={35} colorClass={eye.is_closed?'bg-red-400':'bg-brand-500'}/><ScoreBar label={`PERCLOS — ${(eye.perclos*100).toFixed(1)}%`} value={eye.perclos*100} max={30} colorClass={eye.perclos>0.15?'bg-red-400':'bg-brand-500'}/><ScoreBar label={`Blinks — ${eye.blink_count} total`} value={Math.min(eye.blink_count,50)} max={50} colorClass="bg-blue-400"/></>}
          {posture&&<><ScoreBar label={`Neck angle — ${posture.neck_angle.toFixed(1)}°`} value={posture.neck_angle} max={45} colorClass={posture.neck_alert?'bg-red-400':'bg-brand-500'}/><ScoreBar label={`Slouch — ${posture.slouch_score.toFixed(0)}%`} value={posture.slouch_score} max={100} colorClass={posture.slouch_alert?'bg-amber-400':'bg-brand-500'}/></>}
        </div>
      )}
      {sessionState==='active'&&<p className="text-xs text-gray-400 text-center">{frameCount} frames analysed</p>}
    </div>
  )
}
export default VisionMetrics
