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

const serviceLog = logger.child({ file: 'thought.service.ts' })

export async function createThought(data: ThoughtServerCreate): Promise<Thought> {
  const schema = thoughtServerCreateSchema({
    minTitleLength: config.THOUGHT_TITLE_MIN_LENGTH,
    maxTitleLength: config.THOUGHT_TITLE_MAX_LENGTH,
    minBodyLength: config.THOUGHT_BODY_MIN_LENGTH,
    maxBodyLength: config.THOUGHT_BODY_MAX_LENGTH,
  })
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
    },
  })
  serviceLog.debug(`createThought: ${JSON.stringify(thought)}`)
  return thought
}

export async function updateThought(data: ThoughtServerUpdate): Promise<Thought> {
  const schema = thoughtServerUpdateSchema({
    minTitleLength: config.THOUGHT_TITLE_MIN_LENGTH,
    maxTitleLength: config.THOUGHT_TITLE_MAX_LENGTH,
    minBodyLength: config.THOUGHT_BODY_MIN_LENGTH,
    maxBodyLength: config.THOUGHT_BODY_MAX_LENGTH,
  })
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }
  const { thoughtId, userId, ...updateData } = parsed.data
  const thought = await prisma.thought.update({ where: { thoughtId, userId }, data: updateData })
  serviceLog.debug(`updatedThought: ${JSON.stringify(thought)}`)
  return thought
}

export async function getThought(thoughtId: number, userId: number): Promise<Thought> {
  const thought = await prisma.thought.findUnique({ where: { thoughtId, userId } })
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
  const where = { userId, ...search }
  const params = {
    where,
    orderBy: { [parsed.data.orderBy.field]: parsed.data.orderBy.direction },
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
