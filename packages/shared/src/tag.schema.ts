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
export const tagSchema = z.object({
  tagId: z.number().positive(),
  name: z.string(),
  notes: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export const tagServerSchema = tagSchema
  .extend({
    userId: z.number().positive(),
  })
  .strict()

export const tagClientSchema = tagSchema
export type TagServer = z.output<typeof tagServerSchema>
export type TagClient = z.output<typeof tagClientSchema>

// creation of tags
export const tagCreateSchema = (config: TagConfig) =>
  z.object({
    name: z.string().min(config.minNameLength).max(config.maxNameLength).trim(),
    notes: z.string().max(config.maxNotesLength).trim().default(''),
  })
export type TagCreateRequest = z.input<ReturnType<typeof tagCreateSchema>>

// update of the tags
export const tagUpdateSchema = (config: TagConfig) =>
  z.object({
    tagId: z.number().positive(),
    name: z.string().min(config.minNameLength).max(config.maxNameLength).trim().optional(),
    notes: z.string().max(config.maxNotesLength).trim().optional(),
  })
export type TagUpdateRequest = z.input<ReturnType<typeof tagUpdateSchema>>
