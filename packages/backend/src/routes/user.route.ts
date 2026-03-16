/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { createUser, getConfirmation, getUser, loginUser, sendConfirmation } from '../services/user.service'
import { signToken } from '../utils/jwt'
import { authMiddleware, AuthRequest } from '../utils/express'
import { config } from '../utils/config'
import { UserConfig } from '@brainwave/shared'
import passport from '../utils/passport'

export function registerUserRoutes(): Router {
  const router = Router()

  // public
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

  router.get('/getConfirmation', async (req, res, next) => {
    try {
      const email = (req.query.email as string) ?? ''
      const confirmation = (req.query.token as string) ?? ''
      const confirmed = await getConfirmation(email, confirmation)
      return res.json({ confirmed })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/config', (_req, res) => {
    const registerConfig = {
      minNameLength: config.NAME_MIN_LENGTH,
      minPasswordLength: config.PASSWORD_MIN_LENGTH,
    } as UserConfig
    return res.json(registerConfig)
  })

  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })
  )

  router.get('/google/callback', passport.authenticate('google', { session: false }), async (req: any, res, next) => {
    try {
      const token = signToken({ userId: req.user.userId })
      res.send(`
        <script>
          window.opener.postMessage(
            { token: "${token}" },
            "${config.FRONTEND_URL}"
          );
          window.close();
        </script>
      `)
    } catch (err) {
      return next(err)
    }
  })

  // private
  router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const user = await getUser(req.userId ?? 0)
      return res.json({ ...user })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/sendConfirmation', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      await sendConfirmation(req.userId ?? 0)
      return res.json({ status: 'sent' })
    } catch (err) {
      return next(err)
    }
  })

  return router
}
