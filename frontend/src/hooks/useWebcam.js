import { useState, useRef, useCallback, useEffect } from 'react'

export const useWebcam = () => {
  const [permissionState, setPermissionState] = useState('idle')
  const [isStreaming,     setIsStreaming]      = useState(false)
  const [error,           setError]            = useState(null)
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => () => streamRef.current?.getTracks().forEach(t=>t.stop()), [])

  // Attach the stream to the video element once both exist.
  // This runs after every render, so it correctly fires once the
  // <video> tag actually mounts (i.e. once permissionState flips to 'granted').
  useEffect(() => {
    if (permissionState === 'granted' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [permissionState])

  const stopStream = () => { streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; if(videoRef.current) videoRef.current.srcObject=null; setIsStreaming(false) }

  const requestCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setPermissionState('unsupported'); setError('Browser does not support camera.'); return false }
    setPermissionState('requesting'); setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ width:{ideal:640}, height:{ideal:480}, frameRate:{ideal:15,max:30}, facingMode:'user' } })
      streamRef.current = stream
      setPermissionState('granted'); setIsStreaming(true); return true
    } catch (err) { setPermissionState('denied'); setError(err.name==='NotAllowedError' ? 'Camera permission denied.' : err.message); return false }
  }, [])

  const captureFrame = useCallback((quality=0.7) => {
    const video=videoRef.current; const canvas=canvasRef.current
    if (!video||!canvas||video.readyState<2) return null
    const ctx=canvas.getContext('2d'); canvas.width=video.videoWidth||640; canvas.height=video.videoHeight||480
    ctx.save(); ctx.scale(-1,1); ctx.drawImage(video,-canvas.width,0,canvas.width,canvas.height); ctx.restore()
    return canvas.toDataURL('image/jpeg',quality)
  }, [])

  return { videoRef, canvasRef, permissionState, isStreaming, error, requestCamera, stopStream, captureFrame }
}