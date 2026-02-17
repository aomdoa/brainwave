/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Express } from 'express'
import { checkLive, checkReady } from '../services/health.service'

export function registerHealthRoutes(app: Express): void {
  app.get('/health/live', (_req, res, next) => {
    try {
      res.json(checkLive())
    } catch (err) {
      next(err)
    }
  })

  app.get('/health/ready', (_req, res, next) => {
    try {
      res.json(checkReady())
    } catch (err) {
      next(err)
    }
  })
}
