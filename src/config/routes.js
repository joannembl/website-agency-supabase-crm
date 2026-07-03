import { DEFAULT_NAV, NAV_ITEMS } from './navigation'

export const ROUTES = NAV_ITEMS.reduce((acc, item) => {
  acc[item.name] = {
    label: item.label,
    path: `/${item.name.toLowerCase().replaceAll(' ', '-')}`,
    description: item.description,
  }
  return acc
}, {})

export const FALLBACK_ROUTE = DEFAULT_NAV
