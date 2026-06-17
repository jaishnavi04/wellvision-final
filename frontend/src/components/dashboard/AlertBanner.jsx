import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
const LEVEL_STYLES = { critical:'bg-red-50 border-red-300 text-red-800', warning:'bg-amber-50 border-amber-300 text-amber-800', info:'bg-blue-50 border-blue-300 text-blue-800' }
const AlertBanner = ({ alerts=[] }) => {
  const [dismissed, setDismissed] = useState([])
  const visible = alerts.filter(a=>!dismissed.includes(a.id))
  if(!visible.length) return null
  return (
    <div className="space-y-2">
      {visible.map(alert=>(
        <div key={alert.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border animate-slide-up ${LEVEL_STYLES[alert.level??'warning']}`}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5"/>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{alert.title}</p>
            {alert.message&&<p className="text-xs mt-0.5 opacity-80">{alert.message}</p>}
          </div>
          <button onClick={()=>setDismissed(d=>[...d,alert.id])} className="flex-shrink-0 opacity-60 hover:opacity-100"><X size={14}/></button>
        </div>
      ))}
    </div>
  )
}
export default AlertBanner
