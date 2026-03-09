/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../utils/express'
import { getThought } from '../services/thought.service'
import { getHistory } from '../services/history.service'
import { ThoughtBodyHistory } from '@prisma/client'
import { ThoughtHistoryClient, thoughtHistoryClientSchema } from '@brainwave/shared'

export const publicHistory = (history: ThoughtBodyHistory): ThoughtHistoryClient => {
  console.dir(history)
  return thoughtHistoryClientSchema.parse({
    ...history,
    createdAt: history.createdAt.toISOString(),
  })
}

export function registerThoughtHistoryRoutes(): Router {
  const router = Router()

  router.get('/:id/history', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const thought = await getThought(thoughtId, req.userId ?? 0) // validate access
      const history = await getHistory(thought.thoughtId)
      return res.json(history.map((h) => publicHistory(h)))
    } catch (err) {
      return next(err)
    }
  })

  return router
}
