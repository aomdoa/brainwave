/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Express } from 'express'
import { createUser, getUser, loginUser } from '../services/user.service'
import { signToken } from '../utils/jwt'
import { authMiddleware, AuthRequest } from '../express'

export function registerAuthRoutes(app: Express): void {
  app.post('/register', async (req, res, next) => {
    try {
      await createUser(req.body)
      return res.json({ message: 'success' })
    } catch (err) {
      return next(err)
    }
  })

  app.post('/login', async (req, res, next) => {
    try {
      const user = await loginUser(req.body)
      const token = signToken({ userId: user.id })
      return res.json({ token })
    } catch (err) {
      return next(err)
    }
  })

  app.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const user = await getUser(req.userId ?? 0)
      return res.json({ user })
    } catch (err) {
      return next(err)
    }
  })
}
