import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Radar } from 'react-chartjs-2'
ChartJS.register(RadialLinearScale,PointElement,LineElement,Filler,Tooltip,Legend)
const MoodRadarChart = ({ stats, loading=false }) => {
  if(loading||!stats) return <div className="card p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Wellness Radar</p><div className="h-52 bg-gray-50 rounded-xl animate-pulse"/></div>
  const data = { labels:['Wellness','Posture','Calm','Energy','Focus'],
    datasets:[{ label:'Your Scores', data:[stats.avgWellness??0,stats.avgPosture??0,Math.max(0,100-(stats.avgStress??50)),60,Math.min(100,(stats.avgWellness??0)*1.1)], backgroundColor:'rgba(29,158,117,0.15)', borderColor:'#1d9e75', pointBackgroundColor:'#1d9e75', borderWidth:2, pointRadius:4 }] }
  const options = { responsive:true, maintainAspectRatio:false, scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{size:10},backdropColor:'transparent'},pointLabels:{font:{size:11}},grid:{color:'#e5e7eb'},angleLines:{color:'#e5e7eb'}}}, plugins:{legend:{display:false}} }
  return <div className="card p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Wellness Radar</p><div style={{height:208}}><Radar data={data} options={options}/></div></div>
}
export default MoodRadarChart
