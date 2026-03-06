/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

const relationType = ['RELATED', 'CAUSES', 'CONTRADICTS', 'SUPPORTS', 'DERIVES_FROM'] as const
export type ThoughtRelationType = (typeof relationType)[number]

// core
export const thoughtRelationBaseSchema = z.object({
  thoughtRelationId: z.number().positive(),
  relationType: z.enum(relationType),
  // notes: z.string().optional(), TODO - do we need/want notes on the relation?
  createdAt: z.iso.datetime(),
  thoughtOneId: z.number().positive(),
  thoughtTwoId: z.number().positive(),
})

export const thoughtRelationServerSchema = thoughtRelationBaseSchema.strict()
export const thoughtRelationClientSchema = thoughtRelationBaseSchema.strip()
export type ThoughtRelationServer = z.infer<typeof thoughtRelationServerSchema>
export type ThoughtRelationClient = z.infer<typeof thoughtRelationClientSchema>

// creation of relations
export const thoughtRelationBaseCreateSchema = z.object({
  relationType: z.enum(relationType),
  notes: z.string().optional(),
  thoughtOneId: z.number().positive(),
  thoughtTwoId: z.number().positive(),
})

export const thoughtRelationServerCreateSchema = thoughtRelationBaseCreateSchema
export const thoughtRelationClientCreateSchema = thoughtRelationBaseCreateSchema
export type ThoughtRelationServerCreate = z.infer<typeof thoughtRelationServerCreateSchema>
export type ThoughtRelationClientCreate = z.infer<typeof thoughtRelationClientCreateSchema>
