/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../utils/express'
import { addThoughtTag, getThought, remThoughtTag, updateThoughtTags } from '../services/thought.service'
import { Tag, Thought } from '@prisma/client'
import { publicTag } from './tag.route'
import { publicThought } from './thought.route'

export function registerThoughtTagRoutes(): Router {
  const router = Router()

  router.get('/:id/tags', authMiddleware, authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const thought = (await getThought(thoughtId, req.userId ?? 0)) as Thought & { tags?: Tag[] }
      if (!thought.tags) {
        return res.json([])
      } else {
        return res.json(thought.tags.map(publicTag))
      }
    } catch (err) {
      return next(err)
    }
  })

  router.post('/:id/tags', authMiddleware, authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const tagIds = req.body as number[]
      const thought = await updateThoughtTags(thoughtId, tagIds, req.userId ?? 0)
      return res.json(publicThought(thought))
    } catch (err) {
      return next(err)
    }
  })

  router.put('/:id/tags/:tagId', authMiddleware, authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const tagId = Number(req.params.tagId)
      const thought = await addThoughtTag(thoughtId, tagId, req.userId ?? 0)
      return res.json(publicThought(thought))
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id/tags', authMiddleware, authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const thought = await updateThoughtTags(thoughtId, [], req.userId ?? 0)
      return res.json(publicThought(thought))
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id/tags/:tagId', authMiddleware, authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const tagId = Number(req.params.tagId)
      const thought = await remThoughtTag(thoughtId, tagId, req.userId ?? 0)
      return res.json(publicThought(thought))
    } catch (err) {
      return next(err)
    }
  })

  return router
}
