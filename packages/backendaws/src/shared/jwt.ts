/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import jwt from 'jsonwebtoken'
import ms, { type StringValue } from 'ms'
import { config } from './config'
import { AppError } from './error'

export function signToken(payload: { pk: string }, expiresIn = config.JWT_EXPIRES_IN): string {
  const msValue = ms(expiresIn as StringValue)
  if (!msValue) {
    throw new AppError(`Invalid expiresIn value: ${expiresIn}`)
  }
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: msValue / 1000,
  })
}

export function verifyToken(token: string): string {
  const { pk } = jwt.verify(token, config.JWT_SECRET) as { pk: string }
  return pk
}
