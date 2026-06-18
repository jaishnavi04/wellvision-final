import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerWithEmail } from '@/services/authService'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import GoogleButton from '@/components/auth/GoogleButton'
import Divider from '@/components/ui/Divider'
const getStrength = (pwd) => { let s=0; if(pwd.length>=8)s++; if(/[A-Z]/.test(pwd))s++; if(/[0-9]/.test(pwd))s++; if(/[^A-Za-z0-9]/.test(pwd))s++; return s }
const strengthLabel=['','Weak','Fair','Good','Strong']
const strengthColor=['','bg-red-400','bg-amber-400','bg-yellow-400','bg-brand-500']
const RegisterPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (field) => (e) => setForm(f=>({...f,[field]:e.target.value}))
  const strength = getStrength(form.password)
  const validate = () => {
    const e={}
    if(!form.name.trim()) e.name='Full name is required.'
    if(!form.email.trim()) e.email='Email is required.'
    else if(!/\S+@\S+\.\S+/.test(form.email)) e.email='Enter a valid email.'
    if(!form.password) e.password='Password is required.'
    else if(form.password.length<8) e.password='At least 8 characters.'
    if(form.password!==form.confirm) e.confirm='Passwords do not match.'
    setErrors(e); return Object.keys(e).length===0
  }
  const handleSubmit = async (evt) => {
    evt.preventDefault(); if(!validate()) return; setLoading(true)
    try { await registerWithEmail(form); toast.success('Account created!'); navigate('/dashboard',{replace:true}) }
    catch(err) {
      if(err.message?.includes('email-already-in-use')) setErrors({email:'Account already exists.'})
      else toast.error(err.message||'Registration failed.')
    } finally { setLoading(false) }
  }
  return (
    <AuthLayout>
      <div className="card p-8">
        <div className="mb-7">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500">Already have one? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link></p>
        </div>
        <GoogleButton label="Sign up with Google"/>
        <Divider/>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input label="Full name" type="text" placeholder="Ada Lovelace" autoComplete="name" icon={User} value={form.name} onChange={set('name')} error={errors.name}/>
          <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" icon={Mail} value={form.email} onChange={set('email')} error={errors.email}/>
          <div>
            <label className="form-label" htmlFor="password">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Lock size={16}/></span>
              <input id="password" type={showPwd?'text':'password'} placeholder="Min. 8 characters" autoComplete="new-password" value={form.password} onChange={set('password')} className={`form-input pl-10 pr-10 ${errors.password?'border-red-400 focus:ring-red-400':''}`}/>
              <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{showPwd?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
            {form.password&&(<div className="mt-2"><div className="flex gap-1 mb-1">{[1,2,3,4].map(i=><div key={i} className={`h-1 flex-1 rounded-full ${i<=strength?strengthColor[strength]:'bg-gray-200'}`}/>)}</div><p className={`text-xs font-medium ${strength>=3?'text-brand-600':'text-gray-400'}`}>{strengthLabel[strength]}</p></div>)}
            {errors.password&&<p className="form-error">{errors.password}</p>}
          </div>
          <Input label="Confirm password" type="password" placeholder="Repeat your password" autoComplete="new-password" icon={Lock} value={form.confirm} onChange={set('confirm')} error={errors.confirm}/>
          <div className="bg-brand-50 rounded-xl p-3.5 space-y-1.5">
            {['Real-time voice & vision monitoring','AI-powered recommendations','Private — data never shared'].map(txt=>(
              <div key={txt} className="flex items-center gap-2 text-xs text-brand-700"><CheckCircle2 size={13} className="text-brand-500 flex-shrink-0"/>{txt}</div>
            ))}
          </div>
          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-1">Create account</Button>
        </form>
      </div>
    </AuthLayout>
  )
}
export default RegisterPage
