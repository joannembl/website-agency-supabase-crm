export function FormField({ label, hint, error, children, className = '' }) {
  return <label className={`uiFormField ${error ? 'uiFormField--error' : ''} ${className}`}>
    {label ? <span className="uiFormField__label">{label}</span> : null}
    {children}
    {hint ? <small className="uiFormField__hint">{hint}</small> : null}
    {error ? <small className="uiFormField__error">{error}</small> : null}
  </label>
}

export function FormGrid({ children, className = '' }) {
  return <div className={`uiFormGrid ${className}`}>{children}</div>
}

export function FormActions({ children, className = '' }) {
  return <div className={`uiFormActions ${className}`}>{children}</div>
}
