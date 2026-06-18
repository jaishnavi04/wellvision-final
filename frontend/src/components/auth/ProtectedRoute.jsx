import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PageLoader from '@/components/ui/PageLoader'
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader/>
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace/>
  return children
}
export default ProtectedRoute
