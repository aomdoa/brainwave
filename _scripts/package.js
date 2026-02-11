#!/usr/bin/env node
import { readFileSync, mkdirSync, rmSync, cpSync, copyFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { console } from 'node:inspector'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(path.join(__dirname, '../package.json')))
const name = pkg.name
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
const optBrainwaveDir = path.join(packageDir, 'opt', 'brainwave')
const etcBrainwaveDir = path.join(packageDir, 'etc', 'opt', 'brainwave')
mkdirSync(optBrainwaveDir, { recursive: true })
mkdirSync(etcBrainwaveDir, { recursive: true })
cpSync(path.join(__dirname, '../dist'), optBrainwaveDir, { recursive: true })
copyFileSync(path.join(__dirname, '../package.json'), path.join(optBrainwaveDir, 'package.json'))
copyFileSync(path.join(__dirname, '../yarn.lock'), path.join(optBrainwaveDir, 'yarn.lock'))
copyFileSync(path.join(__dirname, '../config/brainwave.env'), path.join(etcBrainwaveDir, 'brainwave.env'))
execFileSync('yarn', ['install', '--production', '--frozen-lockfile'], { cwd: optBrainwaveDir, stdio: 'inherit' })
console.log(packageDir)
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
  '--prefix', '/',
  '--config-files', 'etc/opt/brainwave/brainwave.env',
  '.',
]
execFileSync('fpm', args, { stdio: 'inherit', cwd: packageDir })
