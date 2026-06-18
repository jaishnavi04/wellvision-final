import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, FileText, RefreshCw, Activity } from 'lucide-react'
import { useWellnessData }  from '@/hooks/useWellnessData'
import { generateReport }   from '@/services/wellnessService'
import Button               from '@/components/ui/Button'
import WellnessTrendChart   from '@/components/charts/WellnessTrendChart'
import StressEmotionChart   from '@/components/charts/StressEmotionChart'
import PostureHeatmap       from '@/components/charts/PostureHeatmap'
import MoodRadarChart       from '@/components/charts/MoodRadarChart'
import SessionHistoryTable  from '@/components/dashboard/SessionHistoryTable'
import toast                from 'react-hot-toast'
const PERIODS=['daily','weekly','monthly']
const sc=(s)=>s>=70?'text-brand-600':s>=45?'text-amber-600':'text-red-600'
const ReportsPage = () => {
  const { sessions, chartData, stats, loading } = useWellnessData()
  const [report,    setReport]    = useState(null)
  const [period,    setPeriod]    = useState('weekly')
  const [generating,setGenerating]= useState(false)
  const handleGenerate = async () => {
    setGenerating(true)
    try { const data=await generateReport(period); setReport(data); toast.success('Report generated!') }
    catch(err) { toast.error(err.message||'Failed to generate report.') }
    finally { setGenerating(false) }
  }
  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3 sticky top-0 z-10 flex-wrap">
        <Link to="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-gray-100 transition-colors"><ChevronLeft size={18} className="text-gray-600"/></Link>
        <span className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-xl"><FileText size={16} className="text-white"/></span>
        <div className="flex-1"><p className="text-sm font-semibold text-gray-900 leading-none">Wellness Reports</p><p className="text-xs text-gray-400">Charts, history and AI insights</p></div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {PERIODS.map(p=><button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${period===p?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{p}</button>)}
        </div>
        <Button onClick={handleGenerate} loading={generating} size="sm" className="gap-1.5"><RefreshCw size={13}/> Generate</Button>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-6 space-y-6">
        {report&&(
          <div className="card p-5 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div><p className="text-xs text-gray-400 mb-1 capitalize">{report.period} report</p><h2 className="text-lg font-display font-bold text-gray-900">{report.sessions_count} sessions analysed</h2><p className="text-sm text-gray-500 mt-0.5">Trend: <span className={report.trend==='improving'?'text-brand-600':report.trend==='declining'?'text-red-600':'text-gray-600'}>{report.trend}</span></p></div>
              <div className="text-right"><p className={`text-3xl font-display font-bold ${sc(report.avg_wellness_score)}`}>{report.avg_wellness_score.toFixed(0)}</p><p className="text-xs text-gray-400">Avg Wellness</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[{l:'Avg Stress',v:`${report.avg_stress_score?.toFixed(0)}%`},{l:'Avg Posture',v:`${report.avg_posture_score?.toFixed(0)}%`},{l:'Dominant Mood',v:report.dominant_emotion}].map(({l,v})=>(
                <div key={l} className="bg-gray-50 rounded-xl px-3 py-2 text-center"><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-semibold text-gray-800 capitalize">{v}</p></div>
              ))}
            </div>
            <div className="border-t border-gray-50 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Insights</p>
              <ul className="space-y-1">{report.insights.map((ins,i)=><li key={i} className="text-sm text-gray-600 flex items-start gap-2"><Activity size={12} className="text-brand-500 flex-shrink-0 mt-1"/>{ins}</li>)}</ul>
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-5"><WellnessTrendChart chartData={chartData} loading={loading}/><StressEmotionChart chartData={chartData} loading={loading}/></div>
        <div className="grid md:grid-cols-2 gap-5"><MoodRadarChart stats={stats} loading={loading}/><PostureHeatmap sessions={sessions} loading={loading}/></div>
        <SessionHistoryTable sessions={sessions} loading={loading}/>
      </main>
    </div>
  )
}
export default ReportsPage
