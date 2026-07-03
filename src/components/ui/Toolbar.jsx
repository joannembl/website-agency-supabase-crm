export function Toolbar({ children, className = '' }) {
  return <div className={`uiToolbar ${className}`}>{children}</div>
}

export function ToolbarGroup({ children, className = '' }) {
  return <div className={`uiToolbar__group ${className}`}>{children}</div>
}
