import { existsSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { exit } from 'node:process'
import { build } from 'vite'

mkdirSync('data', { recursive: true })
mkdirSync('data-processed', { recursive: true })

const sourceDataExists = existsSync('data/cards.json') && existsSync('data/tournaments-all.json')

if (sourceDataExists) {
  execSync('node scripts/build-tiers.mjs', { stdio: 'inherit' })
} else {
  console.log('→ Skipping tier build: data/cards.json and/or data/tournaments-all.json not found.')
  console.log('  Run "npm run data" first to generate data files,')
  console.log('  then re-run "npm install" to generate .dev/* files.')
  exit(0)
}

await build({
  build: { write: false, emptyOutDir: false },
  logLevel: 'warn',
})
