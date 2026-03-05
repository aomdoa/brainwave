/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../utils/express'
import { publicThought } from './thought.route'
import {
  addThoughtRelations,
  getThoughtRelations,
  remThoughtRelations,
  setThoughtRelations,
} from '../services/relation.service'

export function registerThoughtRelationRoutes(): Router {
  const router = Router()

  // thought relations
  router.get('/:id/relations', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const data = await getThoughtRelations(thoughtId, req.userId ?? 0)
      const parsed = data.map((d) => ({ ...d, thought: publicThought(d.thought) }))
      return res.json(parsed)
    } catch (err) {
      return next(err)
    }
  })

  router.post('/:id/relations', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const relatedIds = req.body as number[]
      const data = await setThoughtRelations(thoughtId, relatedIds, req.userId ?? 0)
      const parsed = data.map((d) => ({ ...d, thought: publicThought(d.thought) }))
      return res.json(parsed)
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id/relations', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const data = await setThoughtRelations(thoughtId, [], req.userId ?? 0)
      const parsed = data.map((d) => ({ ...d, thought: publicThought(d.thought) }))
      return res.json(parsed)
    } catch (err) {
      return next(err)
    }
  })

  router.put('/:id/relations/:thoughtId', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const relatedId = Number(req.params.thoughtId)
      const data = await addThoughtRelations(thoughtId, [relatedId], req.userId ?? 0)
      const parsed = data.map((d) => ({ ...d, thought: publicThought(d.thought) }))
      return res.json(parsed)
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id/relations/:thoughtId', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const relatedId = Number(req.params.thoughtId)
      const data = await remThoughtRelations(thoughtId, [relatedId], req.userId ?? 0)
      const parsed = data.map((d) => ({ ...d, thought: publicThought(d.thought) }))
      return res.json(parsed)
    } catch (err) {
      return next(err)
    }
  })

  return router
}
