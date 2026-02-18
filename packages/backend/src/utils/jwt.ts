/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import jwt from 'jsonwebtoken'
import ms, { type StringValue } from 'ms'
import { config } from './config'
import { AppError } from './error'

export function signToken(payload: { userId: number }): string {
  const msValue = ms(config.JWT_EXPIRES_IN as StringValue)
  if (!msValue) {
    throw new AppError(`Invalid JWT_EXPIRES_IN value: ${config.JWT_EXPIRES_IN}`)
  }

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: msValue / 1000,
  })
}

export function verifyToken(token: string): number {
  const { userId } = jwt.verify(token, config.JWT_SECRET) as { userId: number }
  return userId
}
