const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], HOURS=['9am','11am','1pm','3pm','5pm','7pm']
const cellColor=(v)=>{ if(v===null) return 'bg-gray-100'; if(v>=80) return 'bg-brand-500'; if(v>=60) return 'bg-brand-300'; if(v>=40) return 'bg-amber-300'; return 'bg-red-300' }
const buildGrid=(sessions)=>{
  const grid={}
  sessions.forEach(s=>{ const ts=s.startedAt?.toDate?s.startedAt.toDate():new Date(s.startedAt??Date.now()); const day=(ts.getDay()+6)%7, hour=Math.floor(ts.getHours()/2)%HOURS.length, key=`${day}-${hour}`; if(!grid[key]) grid[key]=[]; grid[key].push(s.visionData?.postureScore??s.wellnessScore??50) })
  return DAYS.map((_,d)=>HOURS.map((_,h)=>{ const vals=grid[`${d}-${h}`]; if(!vals?.length) return null; return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) }))
}
const PostureHeatmap = ({ sessions=[], loading=false }) => {
  const grid=buildGrid(sessions)
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Posture Heatmap — This Week</p>
      {loading ? <div className="h-32 bg-gray-50 rounded-xl animate-pulse"/> : (
        <>
          <div className="flex gap-1 mb-1"><div className="w-8"/>{HOURS.map(h=><div key={h} className="flex-1 text-center text-xs text-gray-400">{h}</div>)}</div>
          {DAYS.map((day,d)=>(
            <div key={day} className="flex items-center gap-1 mb-1">
              <div className="w-8 text-xs text-gray-400 text-right pr-1">{day}</div>
              {HOURS.map((_,h)=>{ const val=grid[d][h]; return <div key={h} title={val!==null?`${val}%`:'No data'} className={`flex-1 h-6 rounded transition-colors ${cellColor(val)}`}/> })}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-3 justify-end">
            {[{l:'Poor',c:'bg-red-300'},{l:'Fair',c:'bg-amber-300'},{l:'Good',c:'bg-brand-300'},{l:'Great',c:'bg-brand-500'},{l:'None',c:'bg-gray-100'}].map(({l,c})=>(
              <div key={l} className="flex items-center gap-1"><div className={`w-3 h-3 rounded ${c}`}/><span className="text-xs text-gray-400">{l}</span></div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
export default PostureHeatmap
