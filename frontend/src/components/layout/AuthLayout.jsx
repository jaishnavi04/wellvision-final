import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
const FEATURES = [
  { icon:'🎙️', title:'Voice Analysis',    desc:'Detect stress and emotions from speech in real time.' },
  { icon:'👁️', title:'Vision Monitoring', desc:'Track eye fatigue, drowsiness and posture via webcam.' },
  { icon:'📊', title:'Smart Reports',      desc:'AI-generated wellness insights and personalised tips.' },
]
const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex">
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 p-12 flex-col justify-between relative overflow-hidden">
      <span className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5"/>
      <span className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-white/5"/>
      <Link to="/" className="flex items-center gap-3 z-10">
        <span className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm"><Activity size={20} className="text-white"/></span>
        <span className="text-white font-display font-bold text-xl tracking-tight">WellVision <span className="text-brand-100">AI</span></span>
      </Link>
      <div className="z-10">
        <h1 className="text-4xl font-display font-bold text-white leading-tight mb-4">Your wellness,<br/>understood in real time.</h1>
        <p className="text-brand-100 text-lg leading-relaxed mb-10 max-w-sm">WellVision monitors voice and vision signals to surface how you really feel.</p>
        <div className="space-y-4">
          {FEATURES.map(({icon,title,desc})=>(
            <div key={title} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 text-xl">{icon}</span>
              <div><p className="text-white font-semibold text-sm">{title}</p><p className="text-brand-100 text-sm leading-snug">{desc}</p></div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-brand-200 text-xs z-10">Your data stays private and is never sold. Ever.</p>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-surface-secondary overflow-y-auto">
      <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
        <span className="flex items-center justify-center w-9 h-9 bg-brand-500 rounded-xl"><Activity size={18} className="text-white"/></span>
        <span className="font-display font-bold text-gray-900">WellVision AI</span>
      </Link>
      <div className="w-full max-w-md animate-slide-up">{children}</div>
    </div>
  </div>
)
export default AuthLayout
