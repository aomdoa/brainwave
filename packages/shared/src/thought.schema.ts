/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'
import { searchLinksSchema, searchPageSchema, SearchResultConfig, searchSchema } from './search.schema'
import { tagBaseSchema, tagClientSchema, tagServerSchema } from './tag.schema'

export interface ThoughtConfig {
  minTitleLength: number
  maxTitleLength: number
  minBodyLength: number
  maxBodyLength: number
}

const status = ['ACTIVE', 'INACTIVE', 'CLOSED'] as const
export type ThoughtStatus = (typeof status)[number]
export const THOUGHT_SEARCH_FILTERS = ['status', 'createdAt', 'updatedAt', 'lastFollowUp', 'nextReminder']
export const THOUGHT_SEARCH_ORDERS = ['title', ...THOUGHT_SEARCH_FILTERS]

// core thoughts
export const thoughtBaseSchema = z.object({
  thoughtId: z.number().positive(),
  title: z.string(),
  body: z.string(),
  status: z.enum(status),
  nextReminder: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  lastFollowUp: z.iso.datetime().nullable(),
  tags: z.array(tagBaseSchema).optional(),
})

export const thoughtServerSchema = thoughtBaseSchema
  .extend({
    userId: z.number().positive(),
    tags: z.array(tagServerSchema).optional(),
  })
  .strict()

export const thoughtClientSchema = thoughtBaseSchema.extend({ tags: z.array(tagClientSchema).optional() }).strip()
export type ThoughtServer = z.infer<typeof thoughtServerSchema>
export type ThoughtClient = z.infer<typeof thoughtClientSchema>

// creation of thoughts
export const thoughtBaseCreateSchema = (config: ThoughtConfig) =>
  z.object({
    title: z.string().min(config.minTitleLength).max(config.maxTitleLength).trim(),
    body: z.string().min(config.minBodyLength).max(config.maxBodyLength).trim(),
    status: z.enum(status),
    nextReminder: z.iso.datetime().optional().nullable(),
  })

export const thoughtServerCreateSchema = (config: ThoughtConfig) =>
  thoughtBaseCreateSchema(config).extend({
    userId: z.number().positive(),
  })

export const thoughtClientCreateSchema = thoughtBaseCreateSchema
export type ThoughtServerCreate = z.infer<ReturnType<typeof thoughtServerCreateSchema>>
export type ThoughtClientCreate = z.infer<ReturnType<typeof thoughtClientCreateSchema>>

// update of the thoughts
export const thoughtBaseUpdateSchema = (config: ThoughtConfig) =>
  thoughtBaseCreateSchema(config).partial().extend({
    thoughtId: z.number().positive(),
  })

export const thoughtServerUpdateSchema = (config: ThoughtConfig) =>
  thoughtBaseUpdateSchema(config).extend({
    userId: z.number().positive(),
  })

export const thoughtClientUpdateSchema = thoughtBaseUpdateSchema
export type ThoughtServerUpdate = z.infer<ReturnType<typeof thoughtServerUpdateSchema>>
export type ThoughtClientUpdate = z.infer<ReturnType<typeof thoughtClientUpdateSchema>>

// searching thoughts
export const thoughtSearchResultsSchema = z
  .object({
    data: thoughtServerSchema.array(),
    page: searchPageSchema,
    links: searchLinksSchema,
  })
  .strict()
export const thoughtSearchParamsSchema = (config: SearchResultConfig) =>
  searchSchema(config, THOUGHT_SEARCH_FILTERS, THOUGHT_SEARCH_ORDERS).extend({
    tagId: z
      .preprocess((val) => {
        if (val == null) return undefined
        return Array.isArray(val) ? val.map(Number) : [Number(val)] // always array
      }, z.array(z.number().positive()))
      .optional(),
  })

export type ThoughtSearchResults = z.infer<typeof thoughtSearchResultsSchema>
export type ThoughtSearchParams = z.infer<ReturnType<typeof thoughtSearchParamsSchema>>
