import { X, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
const PostureAlert = ({ alerts=[] }) => {
  const [dismissed, setDismissed] = useState([])
  const visible = alerts.filter((_,i)=>!dismissed.includes(i))
  if(!visible.length) return null
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-xs">
      {alerts.map((msg,i)=>dismissed.includes(i)?null:(
        <div key={i} className="flex items-start gap-2.5 bg-white border border-amber-200 rounded-xl shadow-card-hover px-4 py-3 animate-slide-up">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5"/>
          <p className="text-xs font-medium text-gray-800 leading-snug flex-1">{msg}</p>
          <button onClick={()=>setDismissed(d=>[...d,i])} className="text-gray-400 hover:text-gray-600"><X size={13}/></button>
        </div>
      ))}
    </div>
  )
}
export default PostureAlert
