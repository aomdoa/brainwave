/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware, AuthRequest, buildPageLink } from '../utils/express'
import {
  addThoughtTag,
  createThought,
  deleteThought,
  getThought,
  remThoughtTag,
  searchThoughts,
  touchThought,
  updateThought,
  updateThoughtTags,
} from '../services/thought.service'
import {
  ThoughtClient,
  thoughtClientSchema,
  ThoughtConfig,
  ThoughtServerCreate,
  ThoughtServerUpdate,
} from '@brainwave/shared'
import config from '../utils/config'
import { Tag, Thought } from '@prisma/client'
import { publicTag } from './tag.route'

export const publicThought = (thought: Thought & { tags?: Tag[] }): ThoughtClient => {
  return thoughtClientSchema.parse({
    ...thought,
    createdAt: thought.createdAt.toISOString(),
    updatedAt: thought.updatedAt.toISOString(),
    lastFollowUp: thought.lastFollowUp != null ? thought.lastFollowUp.toISOString() : null,
    nextReminder: thought.nextReminder != null ? thought.nextReminder.toISOString() : null,
    tags: thought.tags ? thought.tags.map(publicTag) : undefined,
  })
}

export function registerThoughtRoutes(): Router {
  const router = Router()

  // public
  router.get('/config', (_req, res) => {
    const thoughtConfig = {
      minTitleLength: config.TITLE_MIN_LENGTH,
      maxTitleLength: config.TITLE_MAX_LENGTH,
      minBodyLength: config.BODY_MIN_LENGTH,
      maxBodyLength: config.BODY_MAX_LENGTH,
    } as ThoughtConfig
    return res.json(thoughtConfig)
  })

  // private
  router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtData = {
        userId: req.userId,
        ...req.body,
      } as ThoughtServerCreate
      const thought = await createThought(thoughtData)
      return res.json(publicThought(thought))
    } catch (err) {
      return next(err)
    }
  })

  router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const thought = await getThought(thoughtId, req.userId ?? 0)
      await touchThought(thought)
      return res.json(publicThought(thought))
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
      } as ThoughtServerUpdate

      const thought = await updateThought(thoughtData)
      return res.json(publicThought(thought))
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const thoughtId = Number(req.params.id)
      const thought = await deleteThought(thoughtId, req.userId ?? 0)
      return res.json(publicThought(thought))
    } catch (err) {
      return next(err)
    }
  })

  /**
   * { data, meta, links }
   *
   * GET /thoughts?search=project&filter=status eq 'ACTIVE' and nextReminder lt '2026-03-01'&orderBy=nextReminder:asc&page=1&size=25
   */

  router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const { data, page } = await searchThoughts(req.query, req.userId ?? 0)
      const links = {
        self: buildPageLink(req, page.current),
        first: buildPageLink(req, 1),
        last: buildPageLink(req, page.totalPages),
        prev: page.current > 1 ? buildPageLink(req, page.current - 1) : undefined,
        next: page.current < page.totalPages ? buildPageLink(req, page.current + 1) : undefined,
      }

      return res.json({ data: data.map(publicThought), page, links })
    } catch (err) {
      return next(err)
    }
  })

  // thoughts with tags
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
