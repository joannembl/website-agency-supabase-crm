export default function Button({ children, variant = 'primary', size = 'md', icon: Icon, className = '', type = 'button', ...props }) {
  return <button type={type} className={`uiButton uiButton--${variant} uiButton--${size} ${className}`} {...props}>
    {Icon ? <Icon size={size === 'sm' ? 14 : 16} /> : null}
    <span>{children}</span>
  </button>
}
