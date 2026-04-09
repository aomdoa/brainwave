#!/usr/bin/env node
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { isRelease, getGitSha } from '../../../_scripts/buildHelper.mjs'

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
