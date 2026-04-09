#!/usr/bin/env node
/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { execSync } from 'node:child_process'

export function getGitSha() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

export function isRelease() {
  try {
    const output = execSync('git tag --points-at HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()

    return output.length > 0
  } catch {
    return false
  }
}
