/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

export interface TagConfig {
  minNameLength: number
  maxNameLength: number
  maxNotesLength: number
}

// core tags
export const tagBaseSchema = z.object({
  tagId: z.number().positive(),
  name: z.string(),
  notes: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const tagServerSchema = tagBaseSchema
  .extend({
    userId: z.number().positive(),
  })
  .strict()

export const tagClientSchema = tagBaseSchema.strip()
export type TagServer = z.infer<typeof tagServerSchema>
export type TagClient = z.infer<typeof tagClientSchema>

// creation of tags
export const tagBaseCreateSchema = (config: TagConfig) =>
  z.object({
    name: z.string().min(config.minNameLength).max(config.maxNameLength).trim(),
    notes: z.string().max(config.maxNotesLength).trim().default(''),
  })

export const tagServerCreateSchema = (config: TagConfig) =>
  tagBaseCreateSchema(config).extend({
    userId: z.number().positive(),
  })

export const tagClientCreateSchema = tagBaseCreateSchema
export type TagServerCreate = z.infer<ReturnType<typeof tagServerCreateSchema>>
export type TagClientCreate = z.infer<ReturnType<typeof tagClientCreateSchema>>

// update of the tags
export const tagBaseUpdateSchema = (config: TagConfig) =>
  tagBaseCreateSchema(config).partial().extend({
    tagId: z.number().positive(),
  })

export const tagServerUpdateSchema = (config: TagConfig) =>
  tagBaseUpdateSchema(config).extend({
    userId: z.number().positive(),
  })

export const tagClientUpdateSchema = tagBaseUpdateSchema
export type TagServerUpdate = z.infer<ReturnType<typeof tagServerUpdateSchema>>
export type TagClientUpdate = z.infer<ReturnType<typeof tagClientUpdateSchema>>
