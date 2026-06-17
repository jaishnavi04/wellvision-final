import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
const PRIORITY_STYLES = { critical:'bg-red-50 border-red-200 text-red-700', high:'bg-orange-50 border-orange-200 text-orange-700', medium:'bg-amber-50 border-amber-200 text-amber-700', low:'bg-gray-50 border-gray-200 text-gray-600' }
const PRIORITY_DOT    = { critical:'bg-red-500', high:'bg-orange-500', medium:'bg-amber-400', low:'bg-gray-400' }
const RecommendationCard = ({ rec }) => {
  const [expanded, setExpanded] = useState(rec.priority==='critical')
  return (
    <div className={`card border transition-shadow hover:shadow-card-hover ${rec.priority==='critical'?'border-red-200':rec.priority==='high'?'border-orange-100':''}`}>
      <button onClick={()=>setExpanded(e=>!e)} className="w-full flex items-start gap-3 p-4 text-left">
        <span className="text-2xl flex-shrink-0">{rec.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[rec.priority]}`}/>
            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[rec.priority]}`}>{rec.priority}</span>
            <span className="text-xs text-gray-400">{rec.duration}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{rec.description}</p>
        </div>
        <span className="text-gray-400 flex-shrink-0 mt-1">{expanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</span>
      </button>
      {expanded&&(
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
          {rec.tips.map((tip,i)=>(
            <div key={i} className="flex items-start gap-2"><CheckCircle2 size={13} className="text-brand-500 flex-shrink-0 mt-0.5"/><p className="text-xs text-gray-600 leading-relaxed">{tip}</p></div>
          ))}
        </div>
      )}
    </div>
  )
}
export default RecommendationCard
