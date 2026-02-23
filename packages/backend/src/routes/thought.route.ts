/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../express'
import {
  createThought,
  deleteThought,
  getThought,
  updateThought,
  UpdateThought,
  type CreateThought,
} from '../services/thought.service'

export function registerThoughtRoute(): Router {
  const router = Router()

  router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtData = {
        userId: req.userId,
        ...req.body,
      } as CreateThought
      const thought = await createThought(thoughtData)
      return res.json(thought)
    } catch (err) {
      return next(err)
    }
  })

  router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const thought = await getThought(thoughtId, req.userId ?? 0)
      return res.json(thought)
    } catch (err) {
      return next(err)
    }
  })

  router.patch('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const thoughtData = {
        thoughtId,
        userId: req.userId,
        ...req.body,
      } as UpdateThought

      const thought = await updateThought(thoughtData)
      return res.json(thought)
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const thought = await deleteThought(thoughtId, req.userId ?? 0)
      return res.json(thought)
    } catch (err) {
      return next(err)
    }
  })

  router.get('/', async (req: AuthRequest, res, next) => {
    try {
      /**
       * const thoughts = await prisma.thought.findMany({
  where: { status: req.query.status, userId: Number(req.query.userId) },
  orderBy: { createdAt: 'desc' },
  take: Number(req.query.limit ?? 10),
})
       */
      return res.json({ error: 'todo' })
    } catch (err) {
      return next(err)
    }
  })
  return router
}
