/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { buildInfo } from '../build-info'

type LiveStatus = {
  status: string
}

type ReadyStatus = LiveStatus & {
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

function checkLive(): LiveStatus {
  return {
    status: 'ok',
  }
}

function checkReady(): ReadyStatus {
  return {
    status: 'ok', // TODO - add real checks for dependencies
    buildInfo: buildInfo,
    dependencies: {
      database: true,
    },
    uptime: process.uptime(),
  }
}

export { checkLive, checkReady, type LiveStatus, type ReadyStatus }
