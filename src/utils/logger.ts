/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import pino, { Logger } from 'pino'
import { config } from './config'

const devTransport =
  config.NODE_ENV !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: true,
        },
      }
    : undefined

const logger: Logger = pino({
  level: config.LOG_LEVEL,
  ...(devTransport ? { transport: devTransport } : {}),
})

export default logger
