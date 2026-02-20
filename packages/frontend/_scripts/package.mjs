#!/usr/bin/env node
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { readFileSync, mkdirSync, rmSync, cpSync, copyFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { console } from 'node:inspector'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(path.join(__dirname, '../package.json')))
const name = pkg.rpmName
const version = pkg.version
const buildDir = path.resolve('build')
const packageDir = path.join(buildDir, 'package')

if (existsSync(buildDir)) {
  rmSync(buildDir, { recursive: true, force: true })
}

const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12)
const snapshotVersion = `${version}.SNAPSHOT.${timestamp}`
const outputFile = path.join(buildDir, `${name}-${snapshotVersion}.rpm`)

// stage the files for build
const srvBrainwaveDir = path.join(packageDir, 'srv', 'brainwave')
mkdirSync(srvBrainwaveDir, { recursive: true })
cpSync(path.join(__dirname, '../dist'), srvBrainwaveDir, { recursive: true })
// prettier-ignore
const args = [
  '-s', 'dir',
  '-t', 'rpm',
  '-p', outputFile,
  '-n', name,
  '-v', snapshotVersion,
  '--architecture', 'all',
  '--iteration', '1',
  '--rpm-user', 'brainwave',
  '--rpm-group', 'brainwave',
  '-m', 'brainwave:brainwave',
  '--directories', '/srv/brainwave',
  '--prefix', '/',
  '--before-install', path.join(__dirname, 'preinstall.sh'),
  '.',
]
execFileSync('fpm', args, { stdio: 'inherit', cwd: packageDir })
