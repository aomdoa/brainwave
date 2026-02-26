/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'
import { checkLive, checkReady, logClientError } from '../../src/services/health.service'
import logger from '../../src/utils/logger'

describe('health.service', () => {
  test('checkLive', () => {
    const result = checkLive()
    expect(result).toStrictEqual({ status: 'ok' })
  })

  test('checkReady', () => {
    const statusSchema = z.object({
      status: z.literal('ok'), // exact value
      buildInfo: z.object({
        version: z.string(),
        buildTime: z.string(),
        gitSha: z.string(),
      }),
      dependencies: z.object({
        database: z.boolean(),
      }),
      uptime: z.number(),
    })

    const ready = checkReady()
    expect(() => statusSchema.parse(ready)).not.toThrow()
  })

  test('logClientError', () => {
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
    const error = {
      stack: 'stack',
      message: 'message',
      component: 'component',
      info: 'info',
    }
    logClientError(error)
    expect(logger.warn).toHaveBeenCalledWith(
      'Client Error: {\"stack\":\"stack\",\"message\":\"message\",\"component\":\"component\",\"info\":\"info\"}'
    )
  })
})
