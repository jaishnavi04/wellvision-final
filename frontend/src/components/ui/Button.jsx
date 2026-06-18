import { Loader2 } from 'lucide-react'
const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium text-sm rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
  danger:    'inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium text-sm rounded-xl transition-all duration-150 disabled:opacity-50',
}
const sizes = { sm:'text-xs px-3.5 py-2', md:'', lg:'text-base px-6 py-3', xl:'text-base px-8 py-3.5' }
const Button = ({ children, variant='primary', size='md', loading=false, fullWidth=false, className='', disabled, ...props }) => (
  <button className={`${variants[variant]} ${sizes[size]} ${fullWidth?'w-full':''} ${className}`} disabled={disabled||loading} {...props}>
    {loading ? <><Loader2 size={16} className="animate-spin"/><span>Loading…</span></> : children}
  </button>
)
export default Button
