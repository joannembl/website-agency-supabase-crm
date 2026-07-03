export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null
  return <nav className="breadcrumbs" aria-label="Breadcrumbs">
    {items.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
  </nav>
}
