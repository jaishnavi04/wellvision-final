import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { resetPassword } from '@/services/authService'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const handleSubmit = async (evt) => {
    evt.preventDefault()
    if(!email.trim()){setError('Please enter your email.');return}
    if(!/\S+@\S+\.\S+/.test(email)){setError('Enter a valid email.');return}
    setLoading(true);setError('')
    try { await resetPassword(email); setSent(true) }
    catch(err) { if(err.message?.includes('user-not-found')) setSent(true); else toast.error('Something went wrong.') }
    finally { setLoading(false) }
  }
  return (
    <AuthLayout>
      <div className="card p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-5"><span className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-50"><CheckCircle2 size={28} className="text-brand-500"/></span></div>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-sm text-gray-500 mb-6">If an account exists for <strong>{email}</strong>, you'll receive a reset link.</p>
            <Link to="/login" className="btn-primary inline-flex">Back to sign in</Link>
          </div>
        ) : (
          <>
            <div className="mb-7"><h2 className="text-2xl font-display font-bold text-gray-900 mb-1">Reset your password</h2><p className="text-sm text-gray-500">Enter your email and we'll send a reset link.</p></div>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" icon={Mail} value={email} onChange={e=>{setEmail(e.target.value);setError('')}} error={error}/>
              <Button type="submit" fullWidth loading={loading} size="lg">Send reset link</Button>
            </form>
            <div className="mt-5 text-center"><Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={15}/> Back to sign in</Link></div>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
export default ForgotPasswordPage
