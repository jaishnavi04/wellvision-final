const Divider = ({ label='or' }) => (
  <div className="relative flex items-center gap-3 my-5">
    <span className="flex-1 h-px bg-gray-200"/>
    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
    <span className="flex-1 h-px bg-gray-200"/>
  </div>
)
export default Divider
