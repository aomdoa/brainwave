/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { Thought } from '@prisma/client'
import {
  thoughtServerCreateSchema,
  ThoughtServerCreate,
  ThoughtServerUpdate,
  thoughtServerUpdateSchema,
  thoughtSearchParamsSchema,
  SearchPage,
  SearchFilter,
} from '@brainwave/shared'
import { config } from '../utils/config'
import { NotFoundError, ValidationError } from '../utils/error'
import { buildPrismaWhere, prisma } from '../utils/prisma'
import logger from '../utils/logger'
import { getTag, getTagsByIds } from './tag.service'
import { createHistory } from './history.service'

const serviceLog = logger.child({ file: 'thought.service.ts' })

function getSchemaConfig() {
  return {
    minTitleLength: config.TITLE_MIN_LENGTH,
    maxTitleLength: config.TITLE_MAX_LENGTH,
    minBodyLength: config.BODY_MIN_LENGTH,
    maxBodyLength: config.BODY_MAX_LENGTH,
  }
}

export async function createThought(data: ThoughtServerCreate): Promise<Thought> {
  const schema = thoughtServerCreateSchema(getSchemaConfig())
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }

  const thought = await prisma.thought.create({
    data: {
      userId: parsed.data.userId,
      title: parsed.data.title,
      body: parsed.data.body,
      status: parsed.data.status,
      nextReminder: parsed.data.nextReminder,
      updatedAt: new Date(),
    },
  })
  serviceLog.debug(`createThought: ${JSON.stringify(thought)}`)
  return thought
}

export async function updateThought(data: ThoughtServerUpdate): Promise<Thought> {
  const schema = thoughtServerUpdateSchema(getSchemaConfig())
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }
  const { thoughtId, userId, ...updateData } = { ...parsed.data, updatedAt: new Date() }
  if (updateData.body) {
    // if we're given a body then probably a history is needed
    const oldThought = await getThought(thoughtId, userId)
    if (oldThought.body !== updateData.body) {
      // only make a history if there is a change
      createHistory(oldThought.thoughtId, oldThought.body)
    }
  }
  const thought = await prisma.thought.update({ where: { thoughtId, userId }, data: updateData })
  serviceLog.debug(`updatedThought: ${JSON.stringify(thought)}`)
  return thought
}

export async function updateThoughtTags(thoughtId: number, tagIds: number[], userId: number): Promise<Thought> {
  const tags = await getTagsByIds(tagIds, userId)
  const thought = await prisma.thought.update({
    where: { thoughtId, userId },
    data: { tags: { set: tags.map((t) => ({ tagId: t.tagId })) } },
    include: { tags: true },
  })
  return thought
}

export async function addThoughtTag(thoughtId: number, tagId: number, userId: number): Promise<Thought> {
  const tag = await getTag(tagId, userId)
  const thought = await prisma.thought.update({
    where: { thoughtId, userId },
    data: { tags: { connect: { tagId: tag.tagId } } },
    include: { tags: true },
  })
  return thought
}

export async function remThoughtTag(thoughtId: number, tagId: number, userId: number): Promise<Thought> {
  const tag = await getTag(tagId, userId)
  const thought = await prisma.thought.update({
    where: { thoughtId, userId },
    data: { tags: { disconnect: { tagId: tag.tagId } } },
    include: { tags: true },
  })
  return thought
}

export async function touchThought(data: Thought): Promise<Thought> {
  const where = { thoughtId: data.thoughtId, userId: data.userId }
  const thought = await prisma.thought.update({ where, data: { lastFollowUp: new Date() } })
  serviceLog.debug(`touchThought: ${JSON.stringify(thought)}`)
  return thought
}

export async function getThought(thoughtId: number, userId: number): Promise<Thought> {
  const thought = await prisma.thought.findUnique({ where: { thoughtId, userId }, include: { tags: true } })
  if (thought == null) {
    throw new NotFoundError(`thought id ${thoughtId} could not be found`)
  }
  serviceLog.debug(`getThought ${JSON.stringify(thought)}`)
  return thought
}

export async function deleteThought(thoughtId: number, userId: number): Promise<Thought> {
  const thought = await prisma.thought.delete({ where: { thoughtId, userId } })
  if (thought == null) {
    throw new NotFoundError(`thought id ${thoughtId} could not be found`)
  }
  serviceLog.debug(`deleteThought ${JSON.stringify(thought)}`)
  return thought
}

export async function searchThoughts(
  rawSearch: unknown,
  userId: number
): Promise<{ data: Thought[]; page: SearchPage }> {
  const schema = thoughtSearchParamsSchema({
    pageSizeMaximum: config.PAGE_SIZE_MAXIMUM,
    pageSizeDefault: config.PAGE_SIZE_DEFAULT,
  })

  const parsed = schema.safeParse(rawSearch)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }

  const search = buildPrismaWhere(parsed.data.filter as SearchFilter[], ['title', 'body'], parsed.data.search)
  const tagIds = parsed.data.tagId ? { tags: { some: { tagId: { in: parsed.data.tagId } } } } : {}
  const where = { userId, ...tagIds, ...search }
  const orderBy: { [key: string]: 'asc' | 'desc' } = parsed.data.orderBy
    ? { [parsed.data.orderBy.field]: parsed.data.orderBy.direction }
    : { ['createdAt']: 'desc' }

  const params = {
    where,
    orderBy,
    skip: (parsed.data.page - 1) * parsed.data.size,
    take: parsed.data.size,
  }
  const [thoughts, count] = await prisma.$transaction([
    prisma.thought.findMany(params),
    prisma.thought.count({ where }),
  ])

  serviceLog.debug(
    `searchThoughts ${JSON.stringify(params)} with results ${JSON.stringify(thoughts)} and total length ${count}`
  )
  return {
    data: thoughts,
    page: {
      current: parsed.data.page,
      size: thoughts.length,
      totalElements: count,
      totalPages: Math.ceil(count / parsed.data.size),
    },
  }
}
