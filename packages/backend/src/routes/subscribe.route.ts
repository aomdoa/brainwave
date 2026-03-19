/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../utils/express'
import webpush from '../utils/webpush'
import { sendNotifications, updateSubscription } from '../services/subscribe.service'

export const subscriptions: any[] = []

export function registerSubscribeRoutes(): Router {
  const router = Router()

  router.post('/test', async (req, res, next) => {
    try {
      await sendNotifications()
      res.status(200).json({ status: 'done' })
    } catch (err) {
      next(err)
    }
  })

  // private
  router.post('/subscribe', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const sub = req.body as webpush.PushSubscription
      const result = await updateSubscription(req.userId ?? 0, sub)
      res.status(201).json({ status: result })
    } catch (err) {
      next(err)
    }
  })

  return router
}
