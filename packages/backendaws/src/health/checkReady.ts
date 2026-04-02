/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { buildInfo } from '../buildInfo'

export type ReadyStatus = {
  status: string
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
