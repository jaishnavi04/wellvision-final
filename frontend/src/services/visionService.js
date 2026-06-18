import { auth } from './firebase'
const WS_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/^http/, 'ws') ?? 'ws://localhost:8000'
export const createVisionSocket = (onMessage, onError, onClose) => {
  const ws = new WebSocket(`${WS_BASE}/api/v1/vision/ws/vision`)
  ws.onopen = async () => {
    const token = await auth.currentUser?.getIdToken()
    if (token) ws.send(JSON.stringify({ type: 'auth', token }))
  }
  ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)) } catch {} }
  ws.onerror = (e) => onError?.(e)
  ws.onclose = () => onClose?.()
  return {
    sendFrame: (b64, n) => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type:'frame', data:b64, frameNum:n })) },
    stop: () => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type:'stop' })) },
    close: () => ws.close(),
  }
}
