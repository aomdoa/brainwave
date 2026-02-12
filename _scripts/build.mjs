#!/usr/bin/env node
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

function getGitSha() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

function isRelease() {
  try {
    const tag = execSync('git describe --tags --always --dirty').toString().trim()
    return !tag.includes('-')
  } catch {
    return false
  }
}

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const version = pkg.version + (isRelease() ? '' : '-SNAPSHOT')

const buildInfo = `// AUTO-GENERATED FILE. DO NOT EDIT.
export const buildInfo = {
  version: "${version}",
  buildTime: "${new Date().toISOString()}",
  gitSha: "${getGitSha()}",
}
`
writeFileSync('./src/build-info.ts', buildInfo)
