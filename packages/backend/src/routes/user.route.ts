/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import {
  createUser,
  getConfirmation,
  getUser,
  loginUser,
  resetPassword,
  sendConfirmation,
  sendForgotPassword,
  updateUser,
} from '../services/user.service'
import { signToken } from '../utils/jwt'
import { authMiddleware, AuthRequest } from '../utils/express'
import { config } from '../utils/config'
import { UserConfig, UserUpdateRequest } from '@brainwave/shared'
import passport from '../utils/passport'
import { ForbiddenError } from '../utils/error'

export function registerUserRoutes(): Router {
  const router = Router()

  // public
  router.post('/register', async (req, res, next) => {
    try {
      const user = await createUser(req.body)
      await sendConfirmation(user.userId)
      res.json(user)
    } catch (err) {
      next(err)
    }
  })

  router.post('/login', async (req, res, next) => {
    try {
      const user = await loginUser(req.body)
      if (!user.isConfirmed) {
        // not confirmed - let the consumer know
        await sendConfirmation(user.userId)
        throw new ForbiddenError('Please completed account validation')
      }
      const token = signToken({ userId: user.userId }, user.authLength ?? config.JWT_EXPIRES_IN)
      res.json({ token })
    } catch (err) {
      next(err)
    }
  })

  router.get('/getConfirmation', async (req, res, next) => {
    try {
      const email = (req.query.email as string) ?? ''
      const confirmation = (req.query.token as string) ?? ''
      const confirmed = await getConfirmation(email, confirmation)
      res.json({ confirmed })
    } catch (err) {
      next(err)
    }
  })

  router.get('/config', (_req, res) => {
    const registerConfig = {
      minNameLength: config.NAME_MIN_LENGTH,
      minPasswordLength: config.PASSWORD_MIN_LENGTH,
    } as UserConfig
    res.json(registerConfig)
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
      const userId = req.user.userId
      const user = await getUser(userId)
      const token = signToken({ userId }, user.authLength ?? config.JWT_EXPIRES_IN)
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
      next(err)
    }
  })

  router.post('/forgotPassword', async (req, res, next) => {
    try {
      const email = (req.body?.email as string) ?? undefined
      await sendForgotPassword(email)
      res.json({ status: 'sent' })
    } catch (err) {
      next(err)
    }
  })

  router.post('/resetPassword', async (req, res, next) => {
    try {
      const token = (req.body?.token as string) ?? undefined
      const password = (req.body?.password as string) ?? undefined
      const confirmPassword = (req.body?.confirmPassword as string) ?? undefined
      await resetPassword(token, password, confirmPassword)
      res.json({ status: 'reset' })
    } catch (err) {
      next(err)
    }
  })

  // private
  router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const user = await getUser(req.userId ?? 0)
      res.json({ ...user })
    } catch (err) {
      next(err)
    }
  })

  router.post('/sendConfirmation', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      await sendConfirmation(req.userId ?? 0)
      res.json({ status: 'sent' })
    } catch (err) {
      next(err)
    }
  })

  router.patch('/me', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const userData = req.body as UserUpdateRequest
      const user = await updateUser(req.userId ?? 0, userData)
      res.json({ ...user })
    } catch (err) {
      next(err)
    }
  })

  return router
}
