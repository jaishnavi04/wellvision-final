const MOOD_EMOJI = { calm:'😌', happy:'😊', neutral:'😐', stressed:'😤', anxious:'😰', sad:'😔' }
const scoreColor=(v,invert=false)=>{ const x=invert?(100-v):v; if(x>=70) return {bar:'bg-brand-500',text:'text-brand-600'}; if(x>=45) return {bar:'bg-amber-400',text:'text-amber-600'}; return {bar:'bg-red-400',text:'text-red-600'} }
const MetricSummaryRow = ({ stats }) => {
  if(!stats) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {['Stress','Posture','Wellness','Mood'].map(l=>(
        <div key={l} className="card p-4 animate-pulse"><div className="h-3 bg-gray-100 rounded w-1/2 mb-3"/><div className="h-6 bg-gray-100 rounded w-1/3 mb-2"/><div className="h-2 bg-gray-100 rounded"/></div>
      ))}
    </div>
  )
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[{key:'avgStress',label:'Avg Stress',unit:'%',invert:true},{key:'avgPosture',label:'Avg Posture',unit:'%',invert:false},{key:'avgWellness',label:'Wellness',unit:'%',invert:false}].map(({key,label,unit,invert})=>{
        const val=stats[key]??0; const {bar,text}=scoreColor(val,invert)
        return (
          <div key={key} className="card p-4">
            <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
            <p className={`text-2xl font-display font-bold mb-2 ${text}`}>{val}{unit}</p>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{width:`${val}%`}}/></div>
          </div>
        )
      })}
      <div className="card p-4">
        <p className="text-xs font-medium text-gray-400 mb-2">Dominant Mood</p>
        <p className="text-3xl mb-1">{MOOD_EMOJI[stats.dominantMood]??'😐'}</p>
        <p className="text-sm font-semibold text-gray-700 capitalize">{stats.dominantMood}</p>
      </div>
    </div>
  )
}
export default MetricSummaryRow
