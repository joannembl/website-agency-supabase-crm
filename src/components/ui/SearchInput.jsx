import { Search } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '', ...props }) {
  return <label className={`uiSearchInput ${className}`}>
    <Search size={16} />
    <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
  </label>
}
