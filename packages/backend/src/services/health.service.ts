/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { buildInfo } from '../build-info'
import logger from '../utils/logger'

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

export type ErrorInformation = {
  message: string
  stack: string
  component: string
  info: string
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

export function logClientError(errorInfo: ErrorInformation) {
  logger.warn(`Client Error: ${JSON.stringify(errorInfo)}`)
}

export default { checkLive, checkReady, logClientError }
