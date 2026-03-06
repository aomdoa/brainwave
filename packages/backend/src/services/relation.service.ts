/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { ThoughtSimplifiedRelation } from '@brainwave/shared'
import logger from '../utils/logger'
import { RelationType, Thought } from '@prisma/client'
import { prisma } from '../utils/prisma'
import { ValidationError } from '../utils/error'

const serviceLog = logger.child({ file: 'relation.service.ts' })

export type ServerThoughtRelation = ThoughtSimplifiedRelation & { thought: Thought }

export async function getThoughtRelations(thoughtId: number, userId: number): Promise<ThoughtSimplifiedRelation[]> {
  const thought = await prisma.thought.findUnique({ where: { thoughtId, userId }, select: { thoughtId: true } })
  if (!thought) {
    throw new ValidationError('Invalid input')
  }
  const relations = await prisma.thoughtRelation.findMany({
    where: {
      OR: [{ thoughtOneId: thoughtId }, { thoughtTwoId: thoughtId }],
      AND: [{ thoughtOne: { userId }, thoughtTwo: { userId } }],
    },
    include: { thoughtOne: true, thoughtTwo: true },
  })
  const results = relations.map((r) => {
    const thought = r.thoughtOneId === thoughtId ? r.thoughtTwo : r.thoughtOne
    return {
      thoughtRelationId: r.thoughtRelationId,
      relationType: r.relationType,
      createdAt: r.createdAt.toISOString(),
      thought: thought,
    } as ServerThoughtRelation
  })
  serviceLog.debug(`getThoughtRelations found ${results.length} relationships for ${thoughtId}`)
  return results
}

export async function addThoughtRelations(
  thoughtId: number,
  relatedIds: number[],
  userId: number
): Promise<ThoughtSimplifiedRelation[]> {
  // get the existing relations (if any) and the valid ids (should be all)
  const existingRelations = await prisma.thoughtRelation.findMany({
    where: {
      OR: [{ thoughtOneId: thoughtId }, { thoughtTwoId: thoughtId }],
      AND: [{ thoughtOne: { userId }, thoughtTwo: { userId } }],
    },
  })
  const existingIds = existingRelations
    .map((e) => (e.thoughtOneId === thoughtId ? e.thoughtTwoId : e.thoughtOneId))
    .concat(thoughtId)
  const validThoughts = await prisma.thought.findMany({
    where: {
      userId,
      thoughtId: { in: [...relatedIds, thoughtId] },
    },
    select: {
      thoughtId: true,
    },
  })
  const validThoughtIds = validThoughts.map((t) => t.thoughtId)
  if (!validThoughtIds.includes(thoughtId)) {
    throw new ValidationError('Invalid input')
  }

  // now build the create and store from the valid data
  const createData = relatedIds
    .filter((id) => !existingIds.includes(id) && validThoughtIds.includes(id))
    .map((relatedId) => {
      return {
        relationType: RelationType.RELATED,
        thoughtOneId: thoughtId,
        thoughtTwoId: relatedId,
      }
    })
  await prisma.thoughtRelation.createMany({ data: createData })
  serviceLog.debug(`addThoughtRelations ${createData.length} relationships for ${thoughtId}`)
  return getThoughtRelations(thoughtId, userId)
}

export async function remThoughtRelations(
  thoughtId: number,
  relatedIds: number[],
  userId: number
): Promise<ThoughtSimplifiedRelation[]> {
  const thought = await prisma.thought.findUnique({ where: { thoughtId, userId }, select: { thoughtId: true } })
  if (!thought) {
    throw new ValidationError('Invalid input')
  }
  const relations = await prisma.thoughtRelation.findMany({
    where: {
      OR: [{ thoughtOneId: thoughtId }, { thoughtTwoId: thoughtId }],
      AND: [{ thoughtOne: { userId }, thoughtTwo: { userId } }],
    },
  })
  const toRemove = relations.filter((r) => relatedIds.includes(r.thoughtOneId) || relatedIds.includes(r.thoughtTwoId))

  await prisma.thoughtRelation.deleteMany({
    where: { thoughtRelationId: { in: toRemove.map((r) => r.thoughtRelationId) } },
  })
  serviceLog.debug(`removeThoughtRelations ${relations.length} relationships for ${thoughtId}`)
  return getThoughtRelations(thoughtId, userId)
}

export async function setThoughtRelations(
  thoughtId: number,
  relatedIds: number[],
  userId: number
): Promise<ThoughtSimplifiedRelation[]> {
  const thought = await prisma.thought.findUnique({ where: { thoughtId, userId }, select: { thoughtId: true } })
  if (!thought) {
    throw new ValidationError('Invalid input')
  }
  await prisma.thoughtRelation.deleteMany({
    where: {
      OR: [{ thoughtOneId: thoughtId }, { thoughtTwoId: thoughtId }],
      AND: [{ thoughtOne: { userId }, thoughtTwo: { userId } }],
    },
  })
  return addThoughtRelations(thoughtId, relatedIds, userId)
}
