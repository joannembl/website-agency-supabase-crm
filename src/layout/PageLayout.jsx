export default function PageLayout({ children, className = '' }) {
  return <section className={`pageLayout ${className}`.trim()}>{children}</section>
}

export function PageToolbar({ children, className = '' }) {
  return <section className={`pageToolbar ${className}`.trim()}>{children}</section>
}

export function PageStats({ children, className = '' }) {
  return <section className={`pageStats ${className}`.trim()}>{children}</section>
}

export function PageContent({ children, className = '' }) {
  return <section className={`pageContent ${className}`.trim()}>{children}</section>
}
