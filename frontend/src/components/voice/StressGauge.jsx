const StressGauge = ({ value=0, label='', color='#1d9e75', size=120 }) => {
  const radius=size/2-12, circumference=Math.PI*radius
  const progress=((100-value)/100)*circumference
  const cx=size/2, cy=size/2+10
  const getColor=(val)=>{ if(val>=70) return '#ef4444'; if(val>=45) return '#f59e0b'; return '#1d9e75' }
  const arcColor=label.toLowerCase().includes('stress')?getColor(value):color
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size*0.65} viewBox={`0 0 ${size} ${size*0.65}`}>
        <path d={`M 12 ${cy} A ${radius} ${radius} 0 0 1 ${size-12} ${cy}`} fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round"/>
        <path d={`M 12 ${cy} A ${radius} ${radius} 0 0 1 ${size-12} ${cy}`} fill="none" stroke={arcColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={progress} style={{transition:'stroke-dashoffset 0.8s ease,stroke 0.5s ease'}}/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="18" fontWeight="700" fill={arcColor} fontFamily="Plus Jakarta Sans,sans-serif">{Math.round(value)}%</text>
      </svg>
      <p className="text-xs font-medium text-gray-500 -mt-1">{label}</p>
    </div>
  )
}
export default StressGauge
