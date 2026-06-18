import { Mic, Eye, Activity, Clock } from 'lucide-react'
const TYPE_META = { voice:{icon:Mic,color:'text-brand-600',bg:'bg-brand-50'}, vision:{icon:Eye,color:'text-blue-600',bg:'bg-blue-50'}, combined:{icon:Activity,color:'text-purple-600',bg:'bg-purple-50'} }
const MOOD_EMOJI = { calm:'😌', happy:'😊', neutral:'😐', stressed:'😤', anxious:'😰', sad:'😔' }
const sc=(s)=>s>=70?'text-brand-600':s>=45?'text-amber-600':'text-red-600'
const fmtDate=(ts)=>{ if(!ts) return '—'; const d=ts?.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) }
const SessionHistoryTable = ({ sessions=[], loading=false }) => {
  if(loading) return <div className="card p-5 space-y-3">{[1,2,3].map(i=><div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse"/>)}</div>
  if(!sessions.length) return <div className="card p-8 text-center"><Activity size={28} className="text-gray-300 mx-auto mb-3"/><p className="text-sm font-medium text-gray-500">No sessions yet</p><p className="text-xs text-gray-400 mt-1">Start a Voice or Vision session to see history.</p></div>
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100"><p className="text-sm font-semibold text-gray-700">Session History</p></div>
      <div className="divide-y divide-gray-50">
        {sessions.map(s=>{ const meta=TYPE_META[s.type]??TYPE_META.voice; const Icon=meta.icon; const score=s.wellnessScore??0; const emotion=s.voiceData?.emotion; return (
          <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
            <span className={`flex items-center justify-center w-8 h-8 rounded-xl ${meta.bg}`}><Icon size={15} className={meta.color}/></span>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 capitalize">{s.type} Session</p><p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11}/>{fmtDate(s.startedAt)}</p></div>
            {emotion&&<span className="text-base" title={emotion}>{MOOD_EMOJI[emotion]??'😐'}</span>}
            <div className="text-right"><p className={`text-sm font-bold ${sc(score)}`}>{Math.round(score)}</p><p className="text-xs text-gray-400">score</p></div>
          </div>
        )})}
      </div>
    </div>
  )
}
export default SessionHistoryTable
