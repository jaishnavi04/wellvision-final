import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth }         from '@/context/AuthContext'
import PageLoader          from '@/components/ui/PageLoader'
import ProtectedRoute      from '@/components/auth/ProtectedRoute'
import LoginPage           from '@/pages/LoginPage'
import RegisterPage        from '@/pages/RegisterPage'
import ForgotPasswordPage  from '@/pages/ForgotPasswordPage'
import DashboardPage       from '@/pages/DashboardPage'
import VoiceSessionPage    from '@/pages/VoiceSessionPage'
import VisionSessionPage   from '@/pages/VisionSessionPage'
import ReportsPage         from '@/pages/ReportsPage'
const PublicRoute = ({ children }) => { const { currentUser, loading } = useAuth(); if(loading) return <PageLoader/>; return currentUser?<Navigate to="/dashboard" replace/>:children }
const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"                element={<Navigate to="/login" replace/>}/>
      <Route path="/login"           element={<PublicRoute><LoginPage/></PublicRoute>}/>
      <Route path="/register"        element={<PublicRoute><RegisterPage/></PublicRoute>}/>
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage/></PublicRoute>}/>
      <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
      <Route path="/voice"           element={<ProtectedRoute><VoiceSessionPage/></ProtectedRoute>}/>
      <Route path="/vision"          element={<ProtectedRoute><VisionSessionPage/></ProtectedRoute>}/>
      <Route path="/reports"         element={<ProtectedRoute><ReportsPage/></ProtectedRoute>}/>
      <Route path="*"                element={<Navigate to="/login" replace/>}/>
    </Routes>
  </BrowserRouter>
)
export default AppRouter
