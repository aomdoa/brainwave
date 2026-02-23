/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { checkLive, checkReady } from '../services/health.service'

export function registerHealthRoutes(): Router {
  const router = Router()
  router.get('/live', (_req, res, next) => {
    try {
      res.json(checkLive())
    } catch (err) {
      next(err)
    }
  })

  router.get('/ready', (_req, res, next) => {
    try {
      res.json(checkReady())
    } catch (err) {
      next(err)
    }
  })
  return router
}
