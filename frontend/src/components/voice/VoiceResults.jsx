import StressGauge from './StressGauge'
import { MessageSquare, Lightbulb, CheckCircle2, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'
const EMOTION_META = {
  calm:     { emoji:'😌', bg:'bg-green-50',  text:'text-green-700'  },
  happy:    { emoji:'😊', bg:'bg-yellow-50', text:'text-yellow-700' },
  neutral:  { emoji:'😐', bg:'bg-gray-50',   text:'text-gray-700'   },
  stressed: { emoji:'😤', bg:'bg-orange-50', text:'text-orange-700' },
  anxious:  { emoji:'😰', bg:'bg-red-50',    text:'text-red-700'    },
  sad:      { emoji:'😔', bg:'bg-blue-50',   text:'text-blue-700'   },
}
const VoiceResults = ({ result, onReset }) => {
  const emotion = EMOTION_META[result.emotion] ?? EMOTION_META.neutral
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="card p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Wellness Scores</p>
        <div className="flex justify-around">
          <StressGauge value={result.stress_score}    label="Stress"/>
          <StressGauge value={result.energy_level}    label="Energy"     color="#3b82f6"/>
          <StressGauge value={result.confidence_score} label="Confidence" color="#8b5cf6"/>
        </div>
      </div>
      <div className="card p-5 flex items-center gap-4">
        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl text-3xl ${emotion.bg}`}>{emotion.emoji}</div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-0.5">Detected Emotion</p>
          <p className={`text-xl font-display font-bold capitalize ${emotion.text}`}>{result.emotion}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-brand-400" style={{width:`${result.emotion_intensity*100}%`,transition:'width 0.8s ease'}}/>
            </div>
            <span className="text-xs text-gray-400">{Math.round(result.emotion_intensity*100)}% intensity</span>
          </div>
        </div>
      </div>
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3"><MessageSquare size={16} className="text-brand-500"/><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transcript</p></div>
        <p className="text-sm text-gray-700 leading-relaxed">{result.transcript||<span className="text-gray-400 italic">No speech detected.</span>}</p>
      </div>
      <div className="card p-5 border-l-4 border-brand-400">
        <div className="flex items-center gap-2 mb-2"><Lightbulb size={16} className="text-brand-500"/><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Recommendation</p></div>
        <p className="text-sm font-medium text-gray-800 mb-3">{result.recommendation}</p>
        <ul className="space-y-2">
          {result.recommendation_tips.map((tip,i)=>(
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle2 size={14} className="text-brand-500 flex-shrink-0 mt-0.5"/>{tip}</li>
          ))}
        </ul>
      </div>
      <Button variant="secondary" fullWidth onClick={onReset} className="gap-2"><RefreshCw size={15}/> New Recording</Button>
    </div>
  )
}
export default VoiceResults
