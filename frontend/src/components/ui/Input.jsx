import { forwardRef } from 'react'
const Input = forwardRef(({ label, error, icon:Icon, className='', id, ...props }, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g,'-')
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <div className="relative">
        {Icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Icon size={16}/></span>}
        <input ref={ref} id={inputId} className={`form-input ${Icon?'pl-10':''} ${error?'border-red-400 focus:ring-red-400':''} ${className}`} {...props}/>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input
