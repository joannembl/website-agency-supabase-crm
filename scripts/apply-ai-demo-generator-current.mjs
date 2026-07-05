#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(__dirname, '..')
const repoRoot = process.cwd()

function repoPath(rel) {
  return path.join(repoRoot, rel)
}

function packagePath(rel) {
  return path.join(packageRoot, 'files', rel)
}

function exists(rel) {
  return fs.existsSync(repoPath(rel))
}

function read(rel) {
  return fs.readFileSync(repoPath(rel), 'utf8')
}

function write(rel, content) {
  fs.writeFileSync(repoPath(rel), content)
  console.log(`updated ${rel}`)
}

function copyFile(rel) {
  const src = packagePath(rel)
  const dest = repoPath(rel)
  if (!fs.existsSync(src)) throw new Error(`Missing package file: ${src}`)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  console.log(`copied ${rel}`)
}

function fixDuplicateStateSetters(app) {
  return app
    .replaceAll('[generatedSiteCopy, setGeneratedSiteCopy, setGeneratedSiteCopy]', '[generatedSiteCopy, setGeneratedSiteCopy]')
    .replaceAll('[generatedSiteHtml, setGeneratedSiteHtml, setGeneratedSiteHtml]', '[generatedSiteHtml, setGeneratedSiteHtml]')
}

function patchBuildDemoProps(app) {
  const start = app.indexOf('buildDemo={{')
  if (start === -1) {
    console.warn('Could not find buildDemo prop object in App.jsx. Skipping prop patch.')
    return app
  }

  let end = app.indexOf('demoManager={{', start)
  if (end === -1) end = app.indexOf('activity={{', start)
  if (end === -1) end = app.indexOf('editLead={{', start)
  if (end === -1) {
    console.warn('Could not find end of buildDemo prop object in App.jsx. Skipping prop patch.')
    return app
  }

  let before = app.slice(0, start)
  let block = app.slice(start, end)
  let after = app.slice(end)

  if (!block.includes('setGeneratedSiteCopy')) {
    block = block.replace('generatedSiteCopy,', 'generatedSiteCopy,\n        setGeneratedSiteCopy,')
  }
  if (!block.includes('setGeneratedSiteHtml')) {
    block = block.replace('generatedSiteHtml,', 'generatedSiteHtml,\n        setGeneratedSiteHtml,')
  }

  return before + block + after
}

function patchAppFile(rel) {
  if (!exists(rel)) return
  let app = read(rel)
  const original = app
  app = fixDuplicateStateSetters(app)
  app = patchBuildDemoProps(app)
  if (app !== original) write(rel, app)
  else console.log(`checked ${rel} — no App patch needed`)
}

function patchStyles() {
  const cssPath = exists('src/styles.css') ? 'src/styles.css' : null
  if (!cssPath) return
  let css = read(cssPath)
  if (css.includes('.demoBuilderAiShell')) {
    console.log('checked src/styles.css — AI demo styles already present')
    return
  }

  css += `

/* AI Demo Generator */
.demoBuilderAiShell{display:grid;gap:18px}.demoBuilderProviderNote{margin:0;color:var(--muted,#64748b);font-size:13px}.errorNotice{background:#fef2f2!important;border-color:#fecaca!important;color:#991b1b!important}.demoBuilderPreviewGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.demoBuilderPreviewCard{border:1px solid var(--border,#e5e7eb);border-radius:18px;background:#fff;padding:16px;min-width:0}.demoBuilderPreviewCard h3{margin:0 0 10px;font-size:15px}.demoBuilderPreviewCard pre{margin:0;white-space:pre-wrap;word-break:break-word;max-height:360px;overflow:auto;background:#f8fafc;border-radius:14px;padding:14px;color:#0f172a;font-size:12px;line-height:1.5}.fullWidth{grid-column:1/-1}@media(max-width:800px){.demoBuilderPreviewGrid{grid-template-columns:1fr}}
`
  write(cssPath, css)
}

function patchDemosIndex() {
  const rel = 'src/features/demos/index.js'
  if (!exists(rel)) return
  let content = read(rel)
  if (!content.includes('aiDemoService')) {
    content += "\nexport * as aiDemoService from './aiDemoService'\n"
    write(rel, content)
  } else {
    console.log('checked src/features/demos/index.js — aiDemoService export already present')
  }
}

function assertRepoRoot() {
  const required = ['package.json', 'src']
  const missing = required.filter(item => !fs.existsSync(repoPath(item)))
  if (missing.length) {
    throw new Error(`Run this from the repo root. Missing: ${missing.join(', ')}`)
  }
}

assertRepoRoot()

copyFile('src/features/demos/aiDemoService.js')
copyFile('src/features/demos/BuildDemoModal.jsx')
copyFile('supabase/functions/generate-demo-site/index.ts')
copyFile('docs/features/AI_DEMO_GENERATOR_PHASE_1_2.md')

patchAppFile('src/App.jsx')
patchAppFile('src/app.jsx')
patchDemosIndex()
patchStyles()

console.log('\nAI Demo Generator Phase 1 and 2 applied to the current repo structure.')
console.log('Next: run pnpm build.')
console.log('To enable real AI: supabase functions deploy generate-demo-site && supabase secrets set OPENAI_API_KEY=sk-your-key')
