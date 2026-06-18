import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeToAuthChanges, fetchUserProfile, logoutUser } from '@/services/authService'
const AuthContext = createContext(null)
export const AuthProvider = ({ children }) => {
  const [currentUser,  setCurrentUser]  = useState(null)
  const [userProfile,  setUserProfile]  = useState(null)
  const [loading,      setLoading]      = useState(true)
  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user)
      if (user) { const profile = await fetchUserProfile(user.uid); setUserProfile(profile) }
      else setUserProfile(null)
      setLoading(false)
    })
    return unsub
  }, [])
  const logout = async () => { await logoutUser(); setCurrentUser(null); setUserProfile(null) }
  const refreshProfile = async () => { if (currentUser) { const p = await fetchUserProfile(currentUser.uid); setUserProfile(p) } }
  return <AuthContext.Provider value={{ currentUser, userProfile, loading, logout, refreshProfile }}>{children}</AuthContext.Provider>
}
export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be inside AuthProvider'); return ctx }
