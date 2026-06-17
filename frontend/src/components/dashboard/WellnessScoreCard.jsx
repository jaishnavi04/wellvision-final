import { useEffect, useRef } from 'react'
const ARC_COLORS = { Excellent:'#1d9e75', Good:'#3b82f6', Fair:'#f59e0b', Poor:'#ef4444' }
const getLabel = (s) => s>=80?'Excellent':s>=65?'Good':s>=45?'Fair':'Poor'
const WellnessScoreCard = ({ score=0, sessions=0, trend='stable' }) => {
  const canvasRef = useRef(null)
  const label = getLabel(score), color = ARC_COLORS[label]
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d'); const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2+10,r=80
    ctx.clearRect(0,0,W,H)
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,2*Math.PI); ctx.strokeStyle='#f3f4f6'; ctx.lineWidth=14; ctx.lineCap='round'; ctx.stroke()
    const end=Math.PI+(score/100)*Math.PI
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,end); ctx.strokeStyle=color; ctx.lineWidth=14; ctx.lineCap='round'; ctx.stroke()
    ctx.font='bold 36px Plus Jakarta Sans,sans-serif'; ctx.fillStyle=color; ctx.textAlign='center'; ctx.fillText(Math.round(score),cx,cy+4)
    ctx.font='13px Inter,sans-serif'; ctx.fillStyle='#9ca3af'; ctx.fillText(label,cx,cy+24)
  },[score,color,label])
  const trendIcon=trend==='improving'?'↑':trend==='declining'?'↓':'→'
  const trendColor=trend==='improving'?'text-brand-600':trend==='declining'?'text-red-500':'text-gray-400'
  return (
    <div className="card p-6 flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Wellness Score</p>
      <canvas ref={canvasRef} width={220} height={140}/>
      <div className="flex items-center gap-4 mt-2">
        <div className="text-center"><p className="text-xl font-display font-bold text-gray-900">{sessions}</p><p className="text-xs text-gray-400">Sessions</p></div>
        <div className="w-px h-8 bg-gray-100"/>
        <div className="text-center"><p className={`text-xl font-display font-bold ${trendColor}`}>{trendIcon}</p><p className="text-xs text-gray-400 capitalize">{trend}</p></div>
      </div>
    </div>
  )
}
export default WellnessScoreCard
