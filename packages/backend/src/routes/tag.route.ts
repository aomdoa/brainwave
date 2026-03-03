/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../utils/express'
import config from '../utils/config'
import { TagClient, tagClientSchema, TagConfig, TagServerCreate, TagServerUpdate } from '@brainwave/shared'
import { Tag } from '@prisma/client'
import { createTag, deleteTag, getTag, getTagByName, getTags, updateTag } from '../services/tag.service'
import { ConflictError } from '../utils/error'

export const publicTag = (tag: Tag): TagClient =>
  tagClientSchema.parse({
    ...tag,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  })

export function registerTagRoutes(): Router {
  const router = Router()

  // public
  router.get('/config', (_req, res) => {
    const tagConfig = {
      minNameLength: config.TITLE_MIN_LENGTH,
      maxNameLength: config.TITLE_MAX_LENGTH,
      maxNotesLength: config.BODY_MAX_LENGTH,
    } as TagConfig
    return res.json(tagConfig)
  })

  // private
  router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const tags = await getTags(req.userId ?? 0)
      return res.json(tags.map(publicTag))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const tagData = {
        userId: req.userId,
        ...req.body,
      } as TagServerCreate
      const existing = await getTagByName(tagData.name, tagData.userId)
      if (existing) {
        throw new ConflictError(`A tag with name ${tagData.name} already exists`)
      }
      const tag = await createTag(tagData)
      return res.json(publicTag(tag))
    } catch (err) {
      return next(err)
    }
  })

  router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const tagId = Number(req.params.id)
      const tag = await getTag(tagId, req.userId ?? 0)
      return res.json(publicTag(tag))
    } catch (err) {
      return next(err)
    }
  })

  router.patch('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const tagId = Number(req.params.id)
      const tagData = {
        tagId,
        userId: req.userId,
        ...req.body,
      } as TagServerUpdate
      if (tagData.name) {
        const existing = await getTagByName(tagData.name, tagData.userId)
        if (existing && existing.tagId != tagId) {
          throw new ConflictError(`A tag with name ${tagData.name} already exists`)
        }
      }
      const tag = await updateTag(tagData)
      return res.json(publicTag(tag))
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const tagId = Number(req.params.id)
      const tag = await deleteTag(tagId, req.userId ?? 0)
      return res.json(publicTag(tag))
    } catch (err) {
      return next(err)
    }
  })

  return router
}
