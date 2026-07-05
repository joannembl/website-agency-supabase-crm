#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { getArg, hasFlag, readCsvRecords, firstValue, slug, listExistingLabels } from './lib.mjs'

const repo = getArg('--repo')
const csv = getArg('--csv', 'planning/github/issues.csv')
const dryRun = hasFlag('--dry-run')
const skipMissingLabels = hasFlag('--skip-missing-labels')
const noAutoLabels = hasFlag('--no-auto-labels')
const limit = Number(getArg('--limit', '0')) || 0
const existingLabels = skipMissingLabels ? listExistingLabels(repo) : null
const records = readCsvRecords(csv)
const selected = limit > 0 ? records.slice(0, limit) : records

function buildBody(record) {
  const body = firstValue(record, ['Body', 'Description', 'Summary'])
  const meta = [
    ['Epic', firstValue(record, ['Epic'])],
    ['Sprint', firstValue(record, ['Sprint'])],
    ['Priority', firstValue(record, ['Priority'])],
    ['Component', firstValue(record, ['Component', 'Feature Area'])],
    ['Target Release', firstValue(record, ['Target Release', 'Release'])],
    ['Story Points', firstValue(record, ['Story Points'])],
    ['Dependency', firstValue(record, ['Dependency', 'Dependencies'])],
  ].filter(([, value]) => value)
  return [
    body,
    '',
    '---',
    '### Planning Metadata',
    ...meta.map(([key, value]) => `- **${key}:** ${value}`),
  ].join('\n')
}
function buildLabels(record) {
  const labels = firstValue(record, ['Labels', 'Label']).split(/[;,]/).map(x => x.trim()).filter(Boolean)
  if (!noAutoLabels) {
    const priority = firstValue(record, ['Priority'])
    const component = firstValue(record, ['Component', 'Feature Area'])
    if (priority) labels.push(`priority-${slug(priority.replace(/^P\d\s*/i, ''))}`)
    if (component) labels.push(slug(component))
  }
  const unique = [...new Set(labels)]
  if (!skipMissingLabels) return unique
  const kept = unique.filter(label => existingLabels.has(label))
  const skipped = unique.filter(label => !existingLabels.has(label))
  if (skipped.length) console.log(`Skipping missing labels: ${skipped.join(', ')}`)
  return kept
}
function run(command) {
  if (dryRun) {
    console.log(`[dry-run] gh ${command.map(x => JSON.stringify(String(x))).join(' ')}`)
    return ''
  }
  return execFileSync('gh', command.map(String), { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}
let created = 0, failed = 0, skipped = 0
for (const record of selected) {
  const title = firstValue(record, ['Title', 'Issue Title', 'Name'])
  if (!title) { skipped++; continue }
  const cmd = ['issue', 'create', '--title', title, '--body', buildBody(record)]
  if (repo) cmd.push('--repo', repo)
  for (const label of buildLabels(record)) cmd.push('--label', label)
  const milestone = firstValue(record, ['Milestone', 'Target Release', 'Release'])
  if (milestone) cmd.push('--milestone', milestone)
  try {
    const out = run(cmd)
    created++
    console.log(`Created: ${title}`)
    if (out.trim()) console.log(out.trim())
  } catch (error) {
    failed++
    console.error(`Failed: ${title}`)
    console.error(error.stderr?.toString() || error.message)
  }
}
console.log(`Done. Created: ${created}. Failed: ${failed}. Skipped: ${skipped}. Dry run: ${dryRun ? 'yes' : 'no'}.`)
