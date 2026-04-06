/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { Tag } from '@prisma/client'
import { TagCreateRequest, tagCreateSchema, TagUpdateRequest, tagUpdateSchema } from '@brainwave/shared'
import { config } from '../utils/config'
import { ConflictError, NotFoundError, ValidationError } from '../utils/error'
import { prisma } from '../utils/prisma'
import logger from '../utils/logger'

const serviceLog = logger.child({ file: 'tag.service.ts' })

function getSchemaConfig() {
  return {
    minNameLength: config.TITLE_MIN_LENGTH,
    maxNameLength: config.TITLE_MAX_LENGTH,
    maxNotesLength: config.BODY_MAX_LENGTH,
  }
}

export async function createTag(userId: number, data: TagCreateRequest): Promise<Tag> {
  const schema = tagCreateSchema(getSchemaConfig())
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }

  const existing = await getTagByName(parsed.data.name, userId)
  if (existing) {
    throw new ConflictError(`A tag with name ${parsed.data.name} already exists`)
  }

  const tag = await prisma.tag.create({
    data: {
      userId,
      name: parsed.data.name,
      notes: parsed.data.notes,
    },
  })
  serviceLog.debug(`createTag: ${JSON.stringify(tag)}`)
  return tag
}

export async function updateTag(userId: number, data: TagUpdateRequest): Promise<Tag> {
  const schema = tagUpdateSchema(getSchemaConfig())
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }
  const { tagId, ...updateData } = parsed.data

  if (updateData.name) {
    const existing = await getTagByName(updateData.name, userId)
    if (existing && existing.tagId != tagId) {
      throw new ConflictError(`A tag with name ${updateData.name} already exists`)
    }
  }

  const tag = await prisma.tag.update({ where: { tagId, userId }, data: updateData })
  serviceLog.debug(`updatedTag: ${JSON.stringify(tag)}`)
  return tag
}

export async function getTagByName(name: string, userId: number): Promise<Tag | null> {
  const tag = await prisma.tag.findUnique({ where: { userId_name: { name, userId } } })
  serviceLog.debug(`getTagByName ${name} ${JSON.stringify(tag)}`)
  return tag
}

export async function getTagsByIds(tagIds: number[], userId: number): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({ where: { tagId: { in: tagIds }, userId } })
  serviceLog.debug(`getTagsByIds ${tagIds.length} with ${tags.length} found`)
  return tags
}

export async function getTag(tagId: number, userId: number): Promise<Tag> {
  const tag = await prisma.tag.findUnique({ where: { tagId, userId } })
  if (tag == null) {
    throw new NotFoundError(`tag id ${tagId} could not be found`)
  }
  serviceLog.debug(`getTag ${JSON.stringify(tag)}`)
  return tag
}

export async function getTags(userId: number): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({ where: { userId } })
  serviceLog.debug(`getTags ${JSON.stringify(tags)}`)
  return tags
}

export async function deleteTag(tagId: number, userId: number): Promise<Tag> {
  const tag = await prisma.tag.delete({ where: { tagId, userId } })
  if (tag == null) {
    throw new NotFoundError(`tag id ${tagId} could not be found`)
  }
  serviceLog.debug(`deleteTag ${JSON.stringify(tag)}`)
  return tag
}
