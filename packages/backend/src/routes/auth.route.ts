/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { createUser, getUser, loginUser } from '../services/user.service'
import { signToken } from '../utils/jwt'
import { authMiddleware, AuthRequest } from '../express'
import { config } from '../utils/config'
import { RegisterConfig } from '@brainwave/shared'

export function registerAuthRoutes(): Router {
  const router = Router()
  router.post('/register', async (req, res, next) => {
    try {
      const user = await createUser(req.body)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  })

  router.post('/login', async (req, res, next) => {
    try {
      const user = await loginUser(req.body)
      const token = signToken({ userId: user.userId })
      return res.json({ token })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const user = await getUser(req.userId ?? 0)
      return res.json({ ...user })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/config', (_req, res) => {
    const registerConfig = {
      minNameLength: config.NAME_MIN_LENGTH,
      minPasswordLength: config.PASSWORD_MIN_LENGTH,
    } as RegisterConfig
    return res.json(registerConfig)
  })

  return router
}
