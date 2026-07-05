import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = p => fs.readFileSync(path.join(root, p), 'utf8')
const write = (p, s) => fs.writeFileSync(path.join(root, p), s)
const exists = p => fs.existsSync(path.join(root, p))

function ensureDir(p) {
  fs.mkdirSync(path.join(root, p), { recursive: true })
}

// 1) Fix Vite resolving ./app to src/app.jsx instead of src/app/index.js
if (exists('src/main.jsx')) {
  let main = read('src/main.jsx')
  main = main.replace(/import\s+\{\s*AppProviders\s*\}\s+from\s+["']\.\/app["'];?/g, "import { AppProviders } from './app/index.js'")
  write('src/main.jsx', main)
  console.log('Fixed src/main.jsx AppProviders import')
}

// 2) Ensure app barrel exports AppProviders
ensureDir('src/app')
if (!exists('src/app/AppProviders.jsx')) {
  write('src/app/AppProviders.jsx', `import React from 'react'\n\nexport default function AppProviders({ children }) {\n  return <React.StrictMode>{children}</React.StrictMode>\n}\n`)
  console.log('Created src/app/AppProviders.jsx')
}
let appIndex = exists('src/app/index.js') ? read('src/app/index.js') : ''
if (!appIndex.includes('AppProviders')) {
  appIndex += `\nexport { default as AppProviders } from './AppProviders.jsx'\n`
  write('src/app/index.js', appIndex.trim() + '\n')
  console.log('Updated src/app/index.js')
}

// 3) Ensure HelpCallout exists and is exported from components/ui
ensureDir('src/components/ui')
if (!exists('src/components/ui/HelpCallout.jsx')) {
  write('src/components/ui/HelpCallout.jsx', `import { Info } from 'lucide-react'\n\nexport default function HelpCallout({ title = 'Tip', children, description, icon: Icon = Info }) {\n  return <div className=\"helpCallout\">\n    <div className=\"helpCalloutIcon\"><Icon size={18} /></div>\n    <div>\n      <strong>{title}</strong>\n      {description ? <p>{description}</p> : children ? <p>{children}</p> : null}\n    </div>\n  </div>\n}\n`)
  console.log('Created src/components/ui/HelpCallout.jsx')
}
let uiIndex = exists('src/components/ui/index.js') ? read('src/components/ui/index.js') : ''
if (!uiIndex.includes('HelpCallout')) {
  uiIndex += `\nexport { default as HelpCallout } from './HelpCallout.jsx'\n`
  write('src/components/ui/index.js', uiIndex.trim() + '\n')
  console.log('Updated src/components/ui/index.js')
}

// 4) Add minimal HelpCallout styles if missing
if (exists('src/styles.css')) {
  let styles = read('src/styles.css')
  if (!styles.includes('.helpCallout')) {
    styles += `\n\n.helpCallout {\n  display: flex;\n  gap: 12px;\n  align-items: flex-start;\n  padding: 14px;\n  border: 1px solid #bfdbfe;\n  border-radius: 16px;\n  background: #eff6ff;\n  color: #1e3a8a;\n}\n.helpCalloutIcon {\n  width: 34px;\n  height: 34px;\n  display: grid;\n  place-items: center;\n  border-radius: 12px;\n  background: #dbeafe;\n  flex: 0 0 auto;\n}\n.helpCallout strong {\n  display: block;\n  margin-bottom: 4px;\n}\n.helpCallout p {\n  margin: 0;\n  color: #1e40af;\n  line-height: 1.45;\n}\n`
    write('src/styles.css', styles)
    console.log('Added HelpCallout styles')
  }
}

console.log('\nDone. Now run: pnpm build')
