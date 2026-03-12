/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware } from '../utils/express'
import webpush from '../utils/webpush'

export const subscriptions: any[] = []

export function registerSubscribeRoutes(): Router {
  const router = Router()

  router.post('/test', async (req, res, next) => {
    const payload = {
      title: 'Brainwave Dev',
      body: 'Server push working!',
    }
    try {
      const results = await Promise.all(
        subscriptions.map((sub) => webpush.sendNotification(sub, JSON.stringify(payload)))
      )
      console.dir(results)
      res.json({ success: true })
    } catch (err) {
      console.dir(err)
      next(err)
    }
  })

  // private
  router.post('/subscribe', authMiddleware, (req, res, next) => {
    try {
      const sub = req.body
      console.dir(sub)
      subscriptions.push(sub)
      res.status(201).json({})
    } catch (err) {
      next(err)
    }
  })

  return router
}
