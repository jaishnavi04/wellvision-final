import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{
      duration: 4000,
      style: { background:'#fff', color:'#111827', borderRadius:'12px', border:'1px solid #e5e7eb', fontSize:'14px' },
      success: { iconTheme: { primary:'#1d9e75', secondary:'#fff' } },
      error:   { iconTheme: { primary:'#ef4444', secondary:'#fff' } },
    }} />
  </React.StrictMode>,
)
