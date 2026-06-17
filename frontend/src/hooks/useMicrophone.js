import { useState, useRef, useCallback, useEffect } from 'react'
const MIME_TYPES = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4']
const getSupportedMimeType = () => MIME_TYPES.find(t => MediaRecorder.isTypeSupported(t)) ?? ''
export const useMicrophone = () => {
  const [permissionState, setPermissionState] = useState('idle')
  const [isRecording,  setIsRecording]  = useState(false)
  const [audioBlob,    setAudioBlob]    = useState(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [error,        setError]        = useState(null)
  const mediaRecorderRef = useRef(null)
  const streamRef        = useRef(null)
  const chunksRef        = useRef([])
  const timerRef         = useRef(null)
  const startTimeRef     = useRef(null)
  const audioContextRef  = useRef(null)
  const analyserRef      = useRef(null)
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t=>t.stop()); audioContextRef.current?.close() }, [])
  const requestPermission = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setPermissionState('unsupported'); setError('Browser does not support microphone.'); return false }
    setPermissionState('requesting'); setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true, sampleRate:16000 } })
      streamRef.current = stream
      const ctx = new AudioContext(); const analyser = ctx.createAnalyser(); analyser.fftSize = 256
      const source = ctx.createMediaStreamSource(stream); source.connect(analyser)
      audioContextRef.current = ctx; analyserRef.current = analyser
      setPermissionState('granted'); return true
    } catch (err) {
      setPermissionState('denied'); setError(err.name==='NotAllowedError' ? 'Microphone permission denied.' : err.message); return false
    }
  }, [])
  const startRecording = useCallback(async () => {
    if (permissionState !== 'granted') { const ok = await requestPermission(); if (!ok) return }
    chunksRef.current = []; setAudioBlob(null); setAudioDuration(0)
    const mimeType = getSupportedMimeType()
    const recorder = new MediaRecorder(streamRef.current, { mimeType: mimeType||undefined, audioBitsPerSecond:128000 })
    recorder.ondataavailable = (e) => { if (e.data.size>0) chunksRef.current.push(e.data) }
    recorder.onstop = () => { setAudioBlob(new Blob(chunksRef.current, {type:mimeType||'audio/webm'})); setAudioDuration(Math.round((Date.now()-startTimeRef.current)/1000)) }
    mediaRecorderRef.current = recorder; recorder.start(100); startTimeRef.current = Date.now(); setIsRecording(true); setError(null)
    timerRef.current = setInterval(() => setAudioDuration(Math.round((Date.now()-startTimeRef.current)/1000)), 1000)
  }, [permissionState, requestPermission])
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state==='recording') mediaRecorderRef.current.stop()
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null }
    setIsRecording(false)
  }, [])
  const resetRecording = useCallback(() => { setAudioBlob(null); setAudioDuration(0); setError(null); chunksRef.current=[] }, [])
  return { permissionState, isRecording, audioBlob, audioDuration, error, analyser:analyserRef.current, requestPermission, startRecording, stopRecording, resetRecording }
}
