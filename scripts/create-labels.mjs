#!/usr/bin/env node
import { getArg, hasFlag, readCsvRecords, runGh } from './lib.mjs'

const repo = getArg('--repo')
const csv = getArg('--csv', 'planning/github/labels.csv')
const dryRun = hasFlag('--dry-run')
const upsert = hasFlag('--upsert')
const rows = readCsvRecords(csv)

let created = 0, updated = 0, failed = 0
for (const row of rows) {
  const name = row.name || row.Name
  const color = (row.color || row.Color || 'ededed').replace('#', '')
  const description = row.description || row.Description || ''
  if (!name) continue
  const base = repo ? ['--repo', repo] : []
  try {
    runGh(['label', 'create', name, '--color', color, '--description', description, ...base], { dryRun })
    created++
    console.log(`Created label: ${name}`)
  } catch (error) {
    if (!upsert) {
      failed++
      console.error(`Failed label: ${name}`)
      console.error(error.stderr?.toString() || error.message)
      continue
    }
    try {
      runGh(['label', 'edit', name, '--color', color, '--description', description, ...base], { dryRun })
      updated++
      console.log(`Updated label: ${name}`)
    } catch (editError) {
      failed++
      console.error(`Failed label upsert: ${name}`)
      console.error(editError.stderr?.toString() || editError.message)
    }
  }
}
console.log(`Done. Created: ${created}. Updated: ${updated}. Failed: ${failed}.`)
