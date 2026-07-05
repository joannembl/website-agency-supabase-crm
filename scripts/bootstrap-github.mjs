#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { getArg, hasFlag } from './lib.mjs'

const repo = getArg('--repo')
const dryRun = hasFlag('--dry-run')
const skipMissingLabels = hasFlag('--skip-missing-labels')
if (!repo) {
  console.error('Usage: node scripts/bootstrap-github.mjs --repo owner/name [--dry-run] [--skip-missing-labels]')
  process.exit(1)
}
function runNode(script, extra = []) {
  const args = ['node', `scripts/${script}`, '--repo', repo, ...extra]
  if (dryRun) args.push('--dry-run')
  console.log(`\n> ${args.join(' ')}`)
  if (!dryRun || script !== 'bootstrap-github.mjs') execFileSync(args[0], args.slice(1), { stdio: 'inherit' })
}
runNode('create-labels.mjs', ['--csv', 'planning/github/labels.csv', '--upsert'])
runNode('create-milestones.mjs', ['--csv', 'planning/github/milestones.csv'])
runNode('import-issues.mjs', ['--csv', 'planning/github/issues.csv', ...(skipMissingLabels ? ['--skip-missing-labels'] : [])])
