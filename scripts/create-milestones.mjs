#!/usr/bin/env node
import { getArg, hasFlag, readCsvRecords, runGh } from './lib.mjs'

const repo = getArg('--repo')
const csv = getArg('--csv', 'planning/github/milestones.csv')
const dryRun = hasFlag('--dry-run')
const rows = readCsvRecords(csv)

let created = 0, skipped = 0, failed = 0
for (const row of rows) {
  const title = row.title || row.Title
  const description = row.description || row.Description || ''
  if (!title) continue
  const cmd = ['api', `repos/${repo}/milestones`, '-f', `title=${title}`, '-f', `description=${description}`]
  if (!repo) {
    console.error('Milestone creation requires --repo owner/name')
    process.exit(1)
  }
  try {
    runGh(cmd, { dryRun })
    created++
    console.log(`Created milestone: ${title}`)
  } catch (error) {
    const stderr = error.stderr?.toString() || error.message
    if (stderr.includes('Validation Failed') || stderr.includes('already_exists')) {
      skipped++
      console.log(`Skipped existing milestone: ${title}`)
    } else {
      failed++
      console.error(`Failed milestone: ${title}`)
      console.error(stderr)
    }
  }
}
console.log(`Done. Created: ${created}. Skipped: ${skipped}. Failed: ${failed}.`)
