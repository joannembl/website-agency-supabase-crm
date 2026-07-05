export const ROUTES = {
  dashboard: '/dashboard',
  prospects: '/prospects',
  pipeline: '/pipeline',
  demoWebsites: '/demo-websites',
  buildDemo: '/build-demo',
  clients: '/clients',
  proposals: '/proposals',
  tasks: '/tasks',
  revenue: '/revenue',
  analytics: '/analytics',
  settings: '/settings',
  help: '/help'
}

export const NAV_TO_ROUTE = {
  Dashboard: ROUTES.dashboard,
  Prospects: ROUTES.prospects,
  Pipeline: ROUTES.pipeline,
  'Demo Websites': ROUTES.demoWebsites,
  Clients: ROUTES.clients,
  Proposals: ROUTES.proposals,
  Tasks: ROUTES.tasks,
  Revenue: ROUTES.revenue,
  Analytics: ROUTES.analytics,
  Settings: ROUTES.settings,
  Help: ROUTES.help
}

export const ROUTE_TO_NAV = Object.entries(NAV_TO_ROUTE).reduce((acc, [nav, route]) => {
  acc[route] = nav
  return acc
}, {})

export function currentRoute() {
  const hash = window.location.hash?.replace(/^#/, '')
  return hash || ROUTES.dashboard
}

export function isBuildDemoRoute(route = currentRoute()) {
  return route === ROUTES.buildDemo || route.startsWith(`${ROUTES.buildDemo}/`)
}

export function navigateHash(route) {
  const next = route || ROUTES.dashboard
  if (window.location.hash.replace(/^#/, '') === next) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = next
}
