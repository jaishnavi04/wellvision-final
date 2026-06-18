import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'

const createUserDoc = async (user, extra = {}) => {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { uid:user.uid, email:user.email, displayName:user.displayName??extra.displayName??'', photoURL:user.photoURL??'', createdAt:serverTimestamp(), lastActive:serverTimestamp(), settings:{notifications:true,theme:'light'}, ...extra })
  }
}
export const registerWithEmail = async ({ name, email, password }) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName: name })
  await createUserDoc(user, { displayName: name })
  return user
}
export const loginWithEmail = async ({ email, password }) => { const { user } = await signInWithEmailAndPassword(auth, email, password); return user }
export const loginWithGoogle = async () => { const { user } = await signInWithPopup(auth, googleProvider); await createUserDoc(user); return user }
export const logoutUser = () => signOut(auth)
export const resetPassword = (email) => sendPasswordResetEmail(auth, email)
export const subscribeToAuthChanges = (cb) => onAuthStateChanged(auth, cb)
export const fetchUserProfile = async (uid) => { const snap = await getDoc(doc(db,'users',uid)); return snap.exists() ? snap.data() : null }
