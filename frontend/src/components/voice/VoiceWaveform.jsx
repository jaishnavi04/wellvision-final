import { useEffect, useRef } from 'react'
const VoiceWaveform = ({ analyser, isRecording, height = 80 }) => {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const frameRef  = useRef(0)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const drawIdle = () => {
      ctx.clearRect(0,0,W,H)
      const bars=40, barW=W/bars
      for(let i=0;i<bars;i++){
        const phase=(frameRef.current*0.03)+(i*0.4)
        const bH=(Math.sin(phase)*0.5+0.5)*(H*0.4)+4
        ctx.fillStyle='rgba(29,158,117,0.3)'
        ctx.beginPath(); ctx.roundRect(i*barW+barW*0.2,(H-bH)/2,barW*0.6,bH,3); ctx.fill()
      }
      frameRef.current++; rafRef.current=requestAnimationFrame(drawIdle)
    }
    const drawLive = () => {
      if(!analyser){drawIdle();return}
      const bufLen=analyser.frequencyBinCount, data=new Uint8Array(bufLen)
      analyser.getByteFrequencyData(data)
      ctx.clearRect(0,0,W,H)
      const barW=(W/bufLen)*2.5; let x=0
      for(let i=0;i<bufLen;i++){
        const bH=(data[i]/255)*H, ratio=data[i]/255
        ctx.fillStyle=`rgb(${Math.round(29+ratio*60)},${Math.round(158-ratio*50)},${Math.round(117-ratio*40)})`
        ctx.beginPath(); ctx.roundRect(x,H-bH,barW-1,bH,2); ctx.fill(); x+=barW+1
      }
      rafRef.current=requestAnimationFrame(drawLive)
    }
    if(isRecording&&analyser) drawLive(); else drawIdle()
    return ()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current) }
  },[analyser,isRecording])
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-brand-50 border border-brand-100" style={{height}}>
      <canvas ref={canvasRef} width={600} height={height} className="w-full h-full"/>
    </div>
  )
}
export default VoiceWaveform
