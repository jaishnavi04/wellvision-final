import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginWithEmail } from '@/services/authService'
import AuthLayout   from '@/components/layout/AuthLayout'
import Input        from '@/components/ui/Input'
import Button       from '@/components/ui/Button'
import GoogleButton from '@/components/auth/GoogleButton'
import Divider      from '@/components/ui/Divider'
const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/dashboard'
  const [form, setForm]     = useState({ email:'', password:'' })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (field) => (e) => setForm(f=>({...f,[field]:e.target.value}))
  const validate = () => {
    const e={}
    if(!form.email.trim()) e.email='Email is required.'
    else if(!/\S+@\S+\.\S+/.test(form.email)) e.email='Enter a valid email.'
    if(!form.password) e.password='Password is required.'
    setErrors(e); return Object.keys(e).length===0
  }
  const handleSubmit = async (evt) => {
    evt.preventDefault(); if(!validate()) return; setLoading(true)
    try { await loginWithEmail(form); toast.success('Welcome back!'); navigate(from,{replace:true}) }
    catch(err) {
      const msg=err.message??''
      if(msg.includes('invalid-credential')||msg.includes('wrong-password')) setErrors({password:'Incorrect email or password.'})
      else if(msg.includes('too-many-requests')) toast.error('Too many attempts. Try again later.')
      else toast.error(msg||'Sign-in failed.')
    } finally { setLoading(false) }
  }
  return (
    <AuthLayout>
      <div className="card p-8">
        <div className="mb-7">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500">New here? <Link to="/register" className="text-brand-600 font-medium hover:underline">Create a free account</Link></p>
        </div>
        <GoogleButton label="Sign in with Google"/>
        <Divider/>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" icon={Mail} value={form.email} onChange={set('email')} error={errors.email}/>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="form-label !mb-0" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline font-medium">Forgot password?</Link>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Lock size={16}/></span>
              <input id="password" type={showPwd?'text':'password'} placeholder="••••••••" autoComplete="current-password" value={form.password} onChange={set('password')} className={`form-input pl-10 pr-10 ${errors.password?'border-red-400 focus:ring-red-400':''}`}/>
              <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPwd?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">Sign in</Button>
        </form>
      </div>
    </AuthLayout>
  )
}
export default LoginPage
