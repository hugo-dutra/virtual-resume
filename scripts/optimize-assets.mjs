#!/usr/bin/env node

import { readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const ROOT_DIR = 'public/assets'
const MAX_BYTES_PER_FILE = 5 * 1024 * 1024

function walkFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
  const output = []

  for (const entry of entries) {
    const fullPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      output.push(...walkFiles(fullPath))
      continue
    }

    output.push(fullPath)
  }

  return output
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = units[0]

  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024
    unit = units[index]
  }

  return `${value.toFixed(2)} ${unit}`
}

const files = walkFiles(ROOT_DIR)

if (files.length === 0) {
  console.log('No asset files found in public/assets')
  process.exit(0)
}

const report = files
  .map((filePath) => {
    const stats = statSync(filePath)
    return {
      path: relative(process.cwd(), filePath),
      ext: extname(filePath).toLowerCase() || '(none)',
      bytes: stats.size,
    }
  })
  .sort((a, b) => b.bytes - a.bytes)

const totalBytes = report.reduce((sum, item) => sum + item.bytes, 0)
const oversizedFiles = report.filter((item) => item.bytes > MAX_BYTES_PER_FILE)

console.log('Asset report (largest first):')
for (const item of report) {
  const status = item.bytes > MAX_BYTES_PER_FILE ? 'OVER_LIMIT' : 'OK'
  console.log(`- ${item.path} | ${item.ext} | ${formatSize(item.bytes)} | ${status}`)
}

console.log(`\nTotal assets: ${report.length} files (${formatSize(totalBytes)})`)
console.log(`Per-file limit: ${formatSize(MAX_BYTES_PER_FILE)}`)

if (oversizedFiles.length > 0) {
  console.error('\nFound oversized assets:')
  for (const item of oversizedFiles) {
    console.error(`- ${item.path} (${formatSize(item.bytes)})`)
  }

  process.exit(1)
}

console.log('\nAll assets are within size limits.')
