/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { Tag } from '@prisma/client'
import { tagServerCreateSchema, TagServerCreate, TagServerUpdate, tagServerUpdateSchema } from '@brainwave/shared'
import { config } from '../utils/config'
import { NotFoundError, ValidationError } from '../utils/error'
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

export async function createTag(data: TagServerCreate): Promise<Tag> {
  const schema = tagServerCreateSchema(getSchemaConfig())
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }

  const tag = await prisma.tag.create({
    data: {
      userId: parsed.data.userId,
      name: parsed.data.name,
      notes: parsed.data.notes,
    },
  })
  serviceLog.debug(`createTag: ${JSON.stringify(tag)}`)
  return tag
}

export async function updateTag(data: TagServerUpdate): Promise<Tag> {
  const schema = tagServerUpdateSchema(getSchemaConfig())
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }
  const { tagId, userId, ...updateData } = parsed.data
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
