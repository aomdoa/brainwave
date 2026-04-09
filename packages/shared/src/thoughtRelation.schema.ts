/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'
import { ThoughtClient, ThoughtServer } from './thought.schema'

const relationType = ['RELATED', 'CAUSES', 'CONTRADICTS', 'SUPPORTS', 'DERIVES_FROM'] as const
export type ThoughtRelationType = (typeof relationType)[number]

// core
export const thoughtRelationSchema = z.object({
  thoughtRelationId: z.number().positive(),
  relationType: z.enum(relationType),
  createdAt: z.iso.datetime(),
  thoughtOneId: z.number().positive(),
  thoughtTwoId: z.number().positive(),
})

export const thoughtRelationServerSchema = thoughtRelationSchema.strict()
export const thoughtRelationClientSchema = thoughtRelationSchema.strip()
export type ThoughtRelationServer = z.output<typeof thoughtRelationServerSchema>
export type ThoughtRelationClient = z.output<typeof thoughtRelationClientSchema>

// creation of relations
export const thoughtRelationCreateSchema = z.object({
  relationType: z.enum(relationType),
  thoughtOneId: z.number().positive(),
  thoughtTwoId: z.number().positive(),
})
export type ThoughtRelationCreate = z.input<typeof thoughtRelationCreateSchema>

// simplified relation
export type ThoughtSimplifiedRelation = {
  thoughtRelationId: number
  relationType: ThoughtRelationType
  createdAt: string
  thought: ThoughtClient | ThoughtServer
}
