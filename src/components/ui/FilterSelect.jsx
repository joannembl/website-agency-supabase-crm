export default function FilterSelect({ label, value, onChange, options = [], className = '' }) {
  return <label className={`uiFilterSelect ${className}`}>
    {label ? <span>{label}</span> : null}
    <select value={value} onChange={onChange}>{options.map(option => <option key={option} value={option}>{option}</option>)}</select>
  </label>
}
