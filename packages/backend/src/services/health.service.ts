/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { buildInfo } from '../build-info'

export type LiveStatus = {
  status: string
}

export type ReadyStatus = LiveStatus & {
  buildInfo: {
    version: string
    buildTime: string
    gitSha: string
  }
  dependencies: {
    database: boolean
  }
  uptime: number
}

export function checkLive(): LiveStatus {
  return {
    status: 'ok',
  }
}

export function checkReady(): ReadyStatus {
  return {
    status: 'ok', // TODO - add real checks for dependencies
    buildInfo: buildInfo,
    dependencies: {
      database: true,
    },
    uptime: process.uptime(),
  }
}

export default { checkLive, checkReady }
