const PageLoader = ({ message = 'Loading WellVision…' }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface-secondary z-50">
    <div className="relative w-14 h-14 mb-5">
      <span className="absolute inset-0 rounded-2xl bg-brand-500 opacity-20 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 shadow-glow">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <path d="M14 4C8.477 4 4 8.477 4 14s4.477 10 10 10 10-4.477 10-10S19.523 4 14 4z" stroke="white" strokeWidth="2" fill="none"/>
          <path d="M9 14l3.5 3.5L19 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
    <p className="text-sm text-gray-500 font-medium animate-pulse">{message}</p>
  </div>
)
export default PageLoader
