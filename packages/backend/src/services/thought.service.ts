/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { Status, Thought } from '@prisma/client'
import { createThoughtSchema } from '@brainwave/shared'
import { config } from '../utils/config'
import { NotFoundError, ValidationError } from '../utils/error'
import { prisma } from '../utils/prisma.config'
import logger from '../utils/logger'

const serviceLog = logger.child({ file: 'thought.service.ts' })

export type CreateThought = {
  userId: number
  title: string
  body: string
  status: Status
  nextReminder: string
}

export type UpdateThought = {
  thoughtId: number
  userId: number
  title?: string
  body?: string
  status?: Status
  nextReminder?: string
}

export function getSchema() {
  return createThoughtSchema({
    minTitleLength: config.THOUGHT_TITLE_MIN_LENGTH,
    maxTitleLength: config.THOUGHT_TITLE_MAX_LENGTH,
    minBodyLength: config.THOUGHT_BODY_MIN_LENGTH,
    maxBodyLength: config.THOUGHT_BODY_MAX_LENGTH,
  })
}
export async function createThought(data: CreateThought): Promise<Thought> {
  const schema = getSchema()
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

export async function updateThought(data: UpdateThought): Promise<Thought> {
  const schema = getSchema().partial()
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }
  const { thoughtId, userId, ...updateData } = data
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
