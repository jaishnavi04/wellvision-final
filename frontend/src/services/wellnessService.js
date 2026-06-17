import { collection, doc, addDoc, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import api from './apiService'

export const saveVoiceSession = async (uid, voiceResult) => {
  const session = { userId:uid, type:'voice', startedAt:serverTimestamp(), duration:0,
    voiceData: { transcript:voiceResult.transcript, emotion:voiceResult.emotion, stressScore:voiceResult.stress_score, energyLevel:voiceResult.energy_level, confidenceScore:voiceResult.confidence_score },
    wellnessScore: computeLocalWellness(voiceResult) }
  const ref = await addDoc(collection(db,'sessions'), session)
  return ref.id
}
export const saveVisionSession = async (uid, visionSummary) => {
  const session = { userId:uid, type:'vision', startedAt:serverTimestamp(), duration:visionSummary.duration_seconds,
    visionData: { earAvg:visionSummary.avg_ear, perclos:visionSummary.avg_drowsiness_score/100, postureScore:visionSummary.avg_posture_score, totalYawns:visionSummary.total_yawns },
    wellnessScore: Math.max(0, 100-(visionSummary.avg_drowsiness_score*0.4)-((100-visionSummary.avg_posture_score)*0.3)) }
  const ref = await addDoc(collection(db,'sessions'), session)
  return ref.id
}
export const subscribeToSessions = (uid, callback) => {
  const q = query(collection(db,'sessions'), where('userId','==',uid), orderBy('startedAt','desc'), limit(20))
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id:d.id, ...d.data() }))))
}
export const fetchSessions = async (uid, limitN=30) => {
  const q = query(collection(db,'sessions'), where('userId','==',uid), orderBy('startedAt','desc'), limit(limitN))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id:d.id, ...d.data() }))
}
export const fetchRecommendations = async (metrics) => { const res = await api.post('/api/v1/recommendations/', metrics); return res.data }
export const generateReport = async (period='weekly') => { const res = await api.post('/api/v1/reports/generate', { period }); return res.data }
export const computeLocalWellness = (r) => { if (!r) return 50; return Math.round((100-(r.stress_score||50))*0.4 + (r.energy_level||50)*0.3 + (r.confidence_score||50)*0.3) }
export const buildChartData = (sessions) => {
  const sorted = [...sessions].reverse()
  const fmt = (ts) => { if (!ts) return ''; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('en',{month:'short',day:'numeric'}) }
  return { labels:sorted.map(s=>fmt(s.startedAt)), wellness:sorted.map(s=>s.wellnessScore??0), stress:sorted.map(s=>s.voiceData?.stressScore??0), energy:sorted.map(s=>s.voiceData?.energyLevel??0), posture:sorted.map(s=>s.visionData?.postureScore??0) }
}
