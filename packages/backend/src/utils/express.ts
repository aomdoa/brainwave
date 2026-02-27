/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express, { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ForbiddenError, ValidationError } from './error'
import config from './config'

export interface AuthRequest extends express.Request {
  userId?: number
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  console.log('AUTH')
  const header = req.headers.authorization
  if (!header) {
    throw new ValidationError('Missing token')
  }

  const token = header.split(' ')[1]
  if (!token) {
    throw new ValidationError('Missing token')
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as { userId: number }
    req.userId = payload.userId
    return next()
  } catch {
    throw new ForbiddenError('Invalid token')
  }
}

export function buildPageLink(req: AuthRequest, page: number) {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`

  const url = new URL(baseUrl)

  // Copy existing query params
  Object.entries(req.query).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })

  // Override page
  url.searchParams.set('page', String(page))

  return url.toString()
}
