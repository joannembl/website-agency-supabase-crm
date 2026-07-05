#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(__dirname, '..')
const repoRoot = process.cwd()

function repoPath(rel) { return path.join(repoRoot, rel) }
function packagePath(rel) { return path.join(packageRoot, 'files', rel) }
function exists(rel) { return fs.existsSync(repoPath(rel)) }
function read(rel) { return fs.readFileSync(repoPath(rel), 'utf8') }
function write(rel, content) { fs.writeFileSync(repoPath(rel), content); console.log(`updated ${rel}`) }
function copyFile(rel) { const src = packagePath(rel); const dest = repoPath(rel); if (!fs.existsSync(src)) throw new Error(`Missing package file: ${src}`); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(src, dest); console.log(`copied ${rel}`) }
function assertRepoRoot() { const missing = ['package.json','src'].filter(item => !fs.existsSync(repoPath(item))); if (missing.length) throw new Error(`Run from repo root. Missing: ${missing.join(', ')}`) }

function patchAppModals() {
  const rel = 'src/features/app/AppModals.jsx'
  if (!exists(rel)) return console.warn('AppModals not found; skipping modal removal')
  let src = read(rel)
  const original = src
  src = src.replace(/import\s+BuildDemoModal\s+from\s+['"][^'"]+['"]\n/g, '')
  src = src.replace(/\s*<BuildDemoModal\s+\{\.\.\.buildDemo\}\s*\/>/g, '')
  src = src.replace(/,?\s*buildDemo\s*\n?\}/, '\n}')
  if (src !== original) write(rel, src); else console.log('checked AppModals — no BuildDemoModal render found')
}

function patchDemosIndex() {
  const rel = 'src/features/demos/index.js'
  if (!exists(rel)) return
  let src = read(rel)
  if (!src.includes('BuildDemoPage')) {
    src += "\nexport { default as BuildDemoPage } from './BuildDemoPage'\n"
    write(rel, src)
  } else console.log('checked demos index — BuildDemoPage already exported')
}

function patchApp() {
  const rel = exists('src/App.jsx') ? 'src/App.jsx' : exists('src/app.jsx') ? 'src/app.jsx' : null
  if (!rel) return console.warn('App file not found; skipping App patch')
  let src = read(rel)
  const original = src

  if (!src.includes("from './router/routeUtils'")) {
    src = src.replace(/import React[^\n]*\n/, match => match + "import { ROUTES, NAV_TO_ROUTE, navigateHash, currentRoute, isBuildDemoRoute } from './router/routeUtils'\n")
    if (!src.includes("from './router/routeUtils'")) {
      src = "import { ROUTES, NAV_TO_ROUTE, navigateHash, currentRoute, isBuildDemoRoute } from './router/routeUtils'\n" + src
    }
  }

  if (!src.includes("BuildDemoPage")) {
    const marker = "import ProspectWorkspace from './features/workspace/ProspectWorkspace'"
    if (src.includes(marker)) {
      src = src.replace(marker, marker + "\nimport BuildDemoPage from './features/demos/BuildDemoPage'")
    } else {
      src = src.replace(/import .*TasksView.*\n/, match => match + "import BuildDemoPage from './features/demos/BuildDemoPage'\n")
    }
  }

  if (!src.includes('const [activeRoute, setActiveRoute]')) {
    const stateMarker = 'const [showCommandPalette, setShowCommandPalette] = useState(false)'
    if (src.includes(stateMarker)) {
      src = src.replace(stateMarker, stateMarker + "\n  const [activeRoute, setActiveRoute] = useState(() => currentRoute())")
    } else {
      src = src.replace(/const \[activeNav[^\n]+\n/, match => match + "  const [activeRoute, setActiveRoute] = useState(() => currentRoute())\n")
    }
  }

  if (!src.includes('handleRouteChange')) {
    const effectBlock = `
  useEffect(() => {
    function handleRouteChange() {
      const nextRoute = currentRoute()
      setActiveRoute(nextRoute)
      const matchingNav = Object.entries(NAV_TO_ROUTE).find(([, route]) => route === nextRoute)?.[0]
      if (matchingNav && matchingNav !== activeNav) {
        setNav(matchingNav)
      }
    }
    window.addEventListener('hashchange', handleRouteChange)
    handleRouteChange()
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [activeNav])
`
    const insertBefore = '  async function addTask(e) {'
    if (src.includes(insertBefore)) src = src.replace(insertBefore, effectBlock + '\n' + insertBefore)
    else src = src.replace(/\n\s*return <AppLayout/, effectBlock + '\n\n  return <AppLayout')
  }

  // Try to route existing setNav calls through hash routes without disrupting state.
  if (!src.includes('navigateHash(NAV_TO_ROUTE[value]')) {
    src = src.replace(/function setNav\(([^)]+)\)\s*\{/, (match, arg) => `function setNav(${arg}) {\n    if (NAV_TO_ROUTE[${arg}]) navigateHash(NAV_TO_ROUTE[${arg}])`)
  }

  // Make openBuildDemo navigate to the full page.
  if (!src.includes('navigateHash(ROUTES.buildDemo)')) {
    src = src.replace(/function openBuildDemo\(([^)]*)\)\s*\{([\s\S]*?)\n\s*\}/, (match, args, body) => {
      if (!body.includes('setBuildLead')) return match
      const nextBody = body.replace(/setBuildLead\(([^)]+)\)/, m => `${m}\n    navigateHash(ROUTES.buildDemo)`)
      return `function openBuildDemo(${args}) {${nextBody}\n  }`
    })
  }

  if (!src.includes('<BuildDemoPage')) {
    const pageBlock = `
      {isBuildDemoRoute(activeRoute) && <BuildDemoPage
        buildLead={buildLead}
        buildForm={buildForm}
        setBuildForm={setBuildForm}
        buildBrief={buildBrief}
        setBuildBrief={setBuildBrief}
        generatedSiteCopy={generatedSiteCopy}
        generatedSiteHtml={generatedSiteHtml}
        setGeneratedSiteCopy={setGeneratedSiteCopy}
        setGeneratedSiteHtml={setGeneratedSiteHtml}
        buildSaving={buildSaving}
        generateDemoBrief={generateDemoBrief}
        generateTemplateSite={generateTemplateSite}
        downloadGeneratedHtml={downloadGeneratedHtml}
        saveBuildDemo={saveBuildDemo}
        onBack={() => {
          setBuildLead(null)
          setNav('Demo Websites')
          navigateHash(ROUTES.demoWebsites)
        }}
      />}
`
    const insertBefore = /\n\s*\{!?workspaceLead[\s\S]*?<ProspectWorkspace/
    const m = src.match(insertBefore)
    if (m) src = src.replace(m[0], '\n' + pageBlock + m[0].replace('{workspaceLead', '{!isBuildDemoRoute(activeRoute) && workspaceLead'))
    else src = src.replace(/\n\s*\{activeNav === 'Dashboard'/, pageBlock + "\n      {!isBuildDemoRoute(activeRoute) && activeNav === 'Dashboard'")
  }

  // Hide normal routed content while build demo page is active.
  const replacements = [
    ["{workspaceLead && <ProspectWorkspace", "{!isBuildDemoRoute(activeRoute) && workspaceLead && <ProspectWorkspace"],
    ["{!workspaceLead && activeNav === 'Dashboard'", "{!isBuildDemoRoute(activeRoute) && !workspaceLead && activeNav === 'Dashboard'"],
    ["{showLeadBoard && <LeadBoard", "{!isBuildDemoRoute(activeRoute) && showLeadBoard && <LeadBoard"],
    ["{!workspaceLead && activeNav === 'Tasks'", "{!isBuildDemoRoute(activeRoute) && !workspaceLead && activeNav === 'Tasks'"],
    ["{!workspaceLead && !showLeadBoard", "{!isBuildDemoRoute(activeRoute) && !workspaceLead && !showLeadBoard"]
  ]
  for (const [from, to] of replacements) src = src.replaceAll(from, to)

  if (src !== original) write(rel, src); else console.log('checked App — route page already applied')
}

function patchStyles() {
  const rel = exists('src/styles.css') ? 'src/styles.css' : null
  if (!rel) return
  let css = read(rel)
  if (css.includes('.demoBuilderPage')) return console.log('checked styles — Build Demo V3 page styles already present')
  css += `

/* Build Demo V3 routed page */
.demoBuilderPage{display:grid;gap:22px;max-width:1440px;margin:0 auto;padding:4px 0 36px}.demoBuilderHero{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;background:linear-gradient(135deg,#fff,#f8fbff);border:1px solid var(--border,#e5e7eb);border-radius:28px;padding:28px;box-shadow:0 24px 70px rgba(15,23,42,.08)}.demoBuilderHero h1{margin:8px 0 8px;font-size:clamp(28px,4vw,46px);letter-spacing:-.05em;color:#0f172a}.demoBuilderHero p{max-width:720px;margin:0;color:#64748b;font-size:16px;line-height:1.55}.demoBuilderEyebrow{font-size:12px!important;text-transform:uppercase;letter-spacing:.12em;font-weight:900;color:#2563eb!important}.demoBuilderHeroActions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}.demoBuilderProgress{display:flex;gap:10px;flex-wrap:wrap}.demoBuilderProgress span{display:inline-flex;align-items:center;gap:7px;border:1px solid #e2e8f0;background:#fff;color:#64748b;border-radius:999px;padding:9px 12px;font-weight:850;font-size:13px}.demoBuilderProgress span.active{background:#ecfdf5;color:#047857;border-color:#bbf7d0}.demoBuilderPageGrid{display:grid;grid-template-columns:minmax(360px,520px) minmax(0,1fr);gap:22px;align-items:start}.demoBuilderPanel{background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:28px;box-shadow:0 20px 60px rgba(15,23,42,.08);padding:24px;min-width:0}.demoBuilderPanelHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:18px}.demoBuilderPanelHeader h2{margin:0;font-size:20px;letter-spacing:-.03em}.demoBuilderPanelHeader p{margin:5px 0 0;color:#64748b;line-height:1.45}.demoBuilderProviderNote{color:#64748b;font-size:13px;margin:10px 0 18px}.demoBuilderTabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.demoBuilderTabs button{display:inline-flex;align-items:center;gap:7px;border:1px solid #e2e8f0;background:#fff;color:#475569;border-radius:999px;padding:8px 11px;font-weight:850;cursor:pointer}.demoBuilderTabs button.active{background:#0f172a;color:#fff;border-color:#0f172a}.demoBuilderBrowser{border:1px solid #dbe3ef;border-radius:22px;overflow:hidden;background:#f8fafc;min-height:620px}.demoBuilderBrowserTop{height:42px;display:flex;align-items:center;gap:7px;padding:0 14px;border-bottom:1px solid #e2e8f0;background:#fff}.demoBuilderBrowserTop span{width:10px;height:10px;border-radius:999px;background:#cbd5e1}.demoBuilderBrowserTop strong{margin-left:auto;display:inline-flex;gap:6px;align-items:center;color:#64748b;font-size:12px}.demoBuilderBrowser iframe{width:100%;height:650px;border:0;background:white}.demoBuilderCodeBlock{min-height:620px;max-height:720px;overflow:auto;white-space:pre-wrap;word-break:break-word;border:1px solid #e2e8f0;border-radius:20px;background:#0f172a;color:#e2e8f0;padding:18px;font-size:12px;line-height:1.55}.errorNotice{background:#fef2f2!important;border-color:#fecaca!important;color:#991b1b!important}.fullWidth{grid-column:1/-1}@media(max-width:1180px){.demoBuilderPageGrid{grid-template-columns:1fr}.demoBuilderHero{flex-direction:column}.demoBuilderHeroActions{justify-content:flex-start}}@media(max-width:720px){.demoBuilderPanel,.demoBuilderHero{border-radius:20px;padding:18px}.demoBuilderBrowser,.demoBuilderCodeBlock{min-height:420px}.demoBuilderBrowser iframe{height:520px}}
`
  write(rel, css)
}

assertRepoRoot()
copyFile('src/router/routeUtils.js')
copyFile('src/features/demos/BuildDemoPage.jsx')
copyFile('docs/features/BUILD_DEMO_V3_ROUTED_PAGE.md')
patchAppModals()
patchDemosIndex()
patchApp()
patchStyles()
console.log('\nBuild Demo V3 routed page applied. Next: pnpm build')
