import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

export const args = process.argv.slice(2)
export function getArg(name, fallback = null) {
  const idx = args.indexOf(name)
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback
}
export function hasFlag(name) {
  return args.includes(name)
}
export function runGh(command, { dryRun = false } = {}) {
  if (dryRun) {
    console.log(`[dry-run] gh ${command.map(x => JSON.stringify(String(x))).join(' ')}`)
    return ''
  }
  return execFileSync('gh', command.map(String), { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]
    if (char === '"') {
      if (inQuotes && next === '"') { field += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(field); field = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++
      row.push(field)
      if (row.some(v => String(v).trim() !== '')) rows.push(row)
      row = []; field = ''
    } else field += char
  }
  row.push(field)
  if (row.some(v => String(v).trim() !== '')) rows.push(row)
  return rows
}
export function readCsvRecords(csvPath) {
  const absolute = path.resolve(csvPath)
  if (!fs.existsSync(absolute)) throw new Error(`CSV not found: ${absolute}`)
  const [headers, ...rows] = parseCsv(fs.readFileSync(absolute, 'utf8'))
  const keys = headers.map(h => h.trim())
  return rows.map(row => Object.fromEntries(keys.map((key, i) => [key, row[i] ?? ''])))
}
export function firstValue(record, keys, fallback = '') {
  for (const key of keys) {
    if (record[key] && String(record[key]).trim()) return String(record[key]).trim()
  }
  return fallback
}
export function slug(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
export function listExistingLabels(repo) {
  const cmd = ['label', 'list', '--limit', '1000', '--json', 'name']
  if (repo) cmd.push('--repo', repo)
  try {
    return new Set(JSON.parse(runGh(cmd) || '[]').map(item => item.name))
  } catch {
    return new Set()
  }
}
