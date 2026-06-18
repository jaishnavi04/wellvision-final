import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
ChartJS.register(CategoryScale,LinearScale,BarElement,Tooltip,Legend)
const StressEmotionChart = ({ chartData, loading=false }) => {
  if(loading||!chartData) return <div className="card p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Stress vs Energy</p><div className="h-44 bg-gray-50 rounded-xl animate-pulse"/></div>
  const data = { labels:chartData.labels, datasets:[
    { label:'Stress %', data:chartData.stress, backgroundColor:'rgba(239,68,68,0.75)', borderRadius:6, borderSkipped:false },
    { label:'Energy %', data:chartData.energy, backgroundColor:'rgba(59,130,246,0.75)', borderRadius:6, borderSkipped:false },
  ]}
  const options = { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}}}, scales:{y:{min:0,max:100,ticks:{stepSize:25,font:{size:11}},grid:{color:'#f3f4f6'}},x:{ticks:{font:{size:11}},grid:{display:false}}} }
  return <div className="card p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Stress vs Energy</p><div style={{height:176}}><Bar data={data} options={options}/></div></div>
}
export default StressEmotionChart
