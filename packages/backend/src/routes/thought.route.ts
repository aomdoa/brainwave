/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware, AuthRequest, buildPageLink } from '../utils/express'
import {
  createThought,
  deleteThought,
  getThought,
  searchThoughts,
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

      return res.json({ data, page, links })
    } catch (err) {
      return next(err)
    }
  })
  return router
}
