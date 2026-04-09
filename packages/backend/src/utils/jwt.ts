/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import jwt from 'jsonwebtoken'
import ms, { type StringValue } from 'ms'
import { config } from './config'
import { AppError } from './error'
import logger from './logger'

const serviceLog = logger.child({ file: 'jwt.ts' })

export function signToken(payload: { userId: number }, configExpiresIn = config.JWT_EXPIRES_IN): string {
  const msValue = ms(configExpiresIn as StringValue)
  if (!msValue) {
    throw new AppError(`Invalid expiresIn value: ${configExpiresIn}`)
  }
  const expiresIn = Math.floor(msValue / 1000)
  const now = Math.floor(Date.now() / 1000)
  const data = { ...payload, iat: now, exp: now + expiresIn }

  serviceLog.debug(`Sign token for ${payload.userId} with expiresIn ${expiresIn} and msValue ${msValue}`)
  return jwt.sign(data, config.JWT_SECRET)
}

export function verifyToken(token: string): number {
  const { userId } = jwt.verify(token, config.JWT_SECRET) as { userId: number }
  serviceLog.debug(`Verified token to ${userId}`)
  return userId
}
