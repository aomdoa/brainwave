/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import jwt from 'jsonwebtoken'
import ms, { type StringValue } from 'ms'
import { config } from './config'
import { AppError } from './error'
import logger from './logger'

const serviceLog = logger.child({ file: 'jwt.ts' })

export function signToken(payload: { userId: number }, expiresIn = config.JWT_EXPIRES_IN): string {
  const msValue = ms(expiresIn as StringValue)
  if (!msValue) {
    throw new AppError(`Invalid expiresIn value: ${expiresIn}`)
  }

  serviceLog.debug(`Sign token for ${payload.userId} with expiresIn ${expiresIn} and msValue ${msValue}`)
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: msValue / 1000,
  })
}

export function verifyToken(token: string): number {
  const { userId } = jwt.verify(token, config.JWT_SECRET) as { userId: number }
  serviceLog.debug(`Verified token to ${userId}`)
  return userId
}
