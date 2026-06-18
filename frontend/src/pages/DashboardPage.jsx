import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Mic, Eye, BarChart2, LogOut, User, RefreshCw, Bell } from 'lucide-react'
import { useAuth }            from '@/context/AuthContext'
import { useWellnessData }    from '@/hooks/useWellnessData'
import { useRecommendations } from '@/hooks/useRecommendations'
import Button                 from '@/components/ui/Button'
import WellnessScoreCard      from '@/components/dashboard/WellnessScoreCard'
import MetricSummaryRow       from '@/components/dashboard/MetricSummaryRow'
import RecommendationCard     from '@/components/dashboard/RecommendationCard'
import AlertBanner            from '@/components/dashboard/AlertBanner'
import SessionHistoryTable    from '@/components/dashboard/SessionHistoryTable'
import WellnessTrendChart     from '@/components/charts/WellnessTrendChart'
import StressEmotionChart     from '@/components/charts/StressEmotionChart'
import MoodRadarChart         from '@/components/charts/MoodRadarChart'

const NAV = [
  { icon:Activity,  label:'Dashboard',     to:'/dashboard' },
  { icon:Mic,       label:'Voice Session', to:'/voice'     },
  { icon:Eye,       label:'Vision Session',to:'/vision'    },
  { icon:BarChart2, label:'Reports',       to:'/reports'   },
]

const getTimeOfDay = () => { const h=new Date().getHours(); return h<12?'morning':h<17?'afternoon':'evening' }

const DashboardPage = () => {
  const { currentUser, userProfile, logout } = useAuth()
  const { sessions, chartData, stats, loading } = useWellnessData()
  const { recs, loading:recsLoading, load:loadRecs } = useRecommendations()
  const name = userProfile?.displayName ?? currentUser?.displayName ?? 'there'

  useEffect(()=>{ if(stats) loadRecs({ stress_score:stats.avgStress, posture_score:stats.avgPosture, energy_level:50 }) },[stats])

  const alerts = []
  if(stats?.avgStress>65) alerts.push({ id:'stress', level:'critical', title:'High Stress Detected', message:'Your recent sessions show elevated stress. Take a break.' })
  if(stats?.avgPosture<50) alerts.push({ id:'posture', level:'warning', title:'Posture Alert', message:'Your posture score has been below 50% recently.' })

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 p-5 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 mb-8">
          <span className="flex items-center justify-center w-8 h-8 bg-brand-500 rounded-xl"><Activity size={16} className="text-white"/></span>
          <span className="font-display font-bold text-gray-900">WellVision</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ icon:Icon, label, to })=>(
            <Link key={label} to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${to==='/dashboard'?'bg-brand-50 text-brand-700':'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon size={17}/>{label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-3 px-1 mb-3">
            {currentUser?.photoURL?(<img src={currentUser.photoURL} alt="av" className="w-8 h-8 rounded-full object-cover"/>):(<span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600"><User size={15}/></span>)}
            <div className="min-w-0"><p className="text-xs font-semibold text-gray-800 truncate">{name}</p><p className="text-xs text-gray-400 truncate">{currentUser?.email}</p></div>
          </div>
          <Button variant="ghost" fullWidth onClick={logout} className="justify-start gap-2 text-gray-500"><LogOut size={15}/> Sign out</Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-surface-secondary/80 backdrop-blur-sm border-b border-gray-100 px-6 md:px-10 py-3 flex items-center justify-between">
          <div><h1 className="text-lg font-display font-bold text-gray-900">Good {getTimeOfDay()}, {name.split(' ')[0]}</h1><p className="text-xs text-gray-400">{stats?`${stats.totalSessions} sessions recorded`:'Start a session to see your wellness data'}</p></div>
          <div className="flex items-center gap-2">
            {alerts.length>0&&(<span className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-xl relative"><Bell size={16} className="text-red-500"/><span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"/></span>)}
            <Button variant="secondary" size="sm" onClick={()=>loadRecs({stress_score:stats?.avgStress??50})}><RefreshCw size={13}/> Refresh</Button>
          </div>
        </div>
        <div className="px-6 md:px-10 py-6 space-y-6">
          {alerts.length>0&&<AlertBanner alerts={alerts}/>}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-1">
              <WellnessScoreCard score={stats?.avgWellness??0} sessions={stats?.totalSessions??0} trend={sessions.length>=2?((sessions[0]?.wellnessScore??0)>(sessions[1]?.wellnessScore??0)?'improving':'stable'):'stable'}/>
            </div>
            <div className="md:col-span-2 flex items-center"><div className="w-full"><MetricSummaryRow stats={stats}/></div></div>
          </div>
          {!stats&&!loading&&(
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/voice" className="card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow cursor-pointer group">
                <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 group-hover:bg-brand-100 transition-colors"><Mic size={22} className="text-brand-600"/></span>
                <div><h3 className="font-semibold text-gray-900 mb-0.5">Start Voice Session</h3><p className="text-sm text-gray-500">Analyse stress, emotion and energy from your voice.</p></div>
              </Link>
              <Link to="/vision" className="card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow cursor-pointer group">
                <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors"><Eye size={22} className="text-blue-600"/></span>
                <div><h3 className="font-semibold text-gray-900 mb-0.5">Start Vision Session</h3><p className="text-sm text-gray-500">Track eye fatigue, posture and drowsiness via webcam.</p></div>
              </Link>
            </div>
          )}
          {chartData&&(<div className="grid md:grid-cols-2 gap-5"><WellnessTrendChart chartData={chartData}/><StressEmotionChart chartData={chartData}/></div>)}
          {stats&&(<div className="grid md:grid-cols-2 gap-5"><MoodRadarChart stats={stats}/><div className="card p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Session Breakdown</p>{['voice','vision'].map(type=>{ const count=sessions.filter(s=>s.type===type).length; const pct=sessions.length?Math.round((count/sessions.length)*100):0; return (<div key={type} className="mb-3"><div className="flex justify-between mb-1"><span className="text-xs capitalize text-gray-600">{type}</span><span className="text-xs font-semibold text-gray-700">{count} ({pct}%)</span></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${type==='voice'?'bg-brand-500':'bg-blue-500'}`} style={{width:`${pct}%`}}/></div></div>) })}</div></div>)}
          <div>
            <div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold text-gray-700">AI Recommendations</h2>{recsLoading&&<span className="text-xs text-gray-400 animate-pulse">Generating...</span>}</div>
            {recs?.recommendations?.length?(<div className="grid md:grid-cols-2 gap-3">{recs.recommendations.map(rec=><RecommendationCard key={rec.id} rec={rec}/>)}</div>):(!recsLoading&&<div className="card p-6 text-center text-sm text-gray-400">Run a session to generate personalised recommendations.</div>)}
          </div>
          <SessionHistoryTable sessions={sessions} loading={loading}/>
        </div>
      </main>
    </div>
  )
}
export default DashboardPage
