import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Filler,Tooltip,Legend)
const WellnessTrendChart = ({ chartData, loading=false }) => {
  if(loading||!chartData) return <div className="card p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Wellness Trend</p><div className="h-44 bg-gray-50 rounded-xl animate-pulse"/></div>
  const data = { labels:chartData.labels, datasets:[
    { label:'Wellness Score', data:chartData.wellness, borderColor:'#1d9e75', backgroundColor:'rgba(29,158,117,0.08)', fill:true, tension:0.4, pointRadius:4, pointBackgroundColor:'#1d9e75', borderWidth:2 },
    { label:'Stress',         data:chartData.stress,   borderColor:'#ef4444', backgroundColor:'transparent', fill:false, tension:0.4, pointRadius:3, borderWidth:1.5, borderDash:[4,4] },
  ]}
  const options = { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}},tooltip:{mode:'index',intersect:false}}, scales:{y:{min:0,max:100,ticks:{stepSize:25,font:{size:11}},grid:{color:'#f3f4f6'}},x:{ticks:{font:{size:11}},grid:{display:false}}} }
  return <div className="card p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Wellness Trend</p><div style={{height:176}}><Line data={data} options={options}/></div></div>
}
export default WellnessTrendChart
