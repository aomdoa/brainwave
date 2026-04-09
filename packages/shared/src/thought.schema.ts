/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'
import { searchLinksSchema, searchPageSchema, SearchResultConfig, searchSchema } from './search.schema'
import { tagSchema, tagClientSchema, tagServerSchema } from './tag.schema'

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
export const thoughtSchema = z.object({
  thoughtId: z.number().positive(),
  title: z.string(),
  body: z.string(),
  status: z.enum(status),
  nextReminder: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  lastFollowUp: z.iso.datetime().nullable(),
  tags: z.array(tagSchema).default([]),
})
export const thoughtServerSchema = thoughtSchema
  .extend({
    userId: z.number().positive(),
  })
  .strict()
export const thoughtClientSchema = thoughtSchema.strip()
export type ThoughtServer = z.output<typeof thoughtServerSchema>
export type ThoughtClient = z.output<typeof thoughtClientSchema>

// creation of thoughts
export const thoughtCreateSchema = (config: ThoughtConfig) =>
  z.object({
    title: z.string().min(config.minTitleLength).max(config.maxTitleLength).trim(),
    body: z.string().min(config.minBodyLength).max(config.maxBodyLength).trim(),
    status: z.enum(status),
    nextReminder: z.iso.datetime().nullable().optional(),
  })
export type ThoughtCreate = z.input<ReturnType<typeof thoughtCreateSchema>>

// update of the thoughts
export const thoughtUpdateSchema = (config: ThoughtConfig) =>
  z.object({
    thoughtId: z.number().positive(),
    title: z.string().min(config.minTitleLength).max(config.maxTitleLength).trim().optional(),
    body: z.string().min(config.minBodyLength).max(config.maxBodyLength).trim().optional(),
    status: z.enum(status).optional(),
    nextReminder: z.iso.datetime().nullable().optional(),
  })
export type ThoughtUpdate = z.input<ReturnType<typeof thoughtUpdateSchema>>

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

export type ThoughtSearchResults = z.output<typeof thoughtSearchResultsSchema>
export type ThoughtSearchParams = z.output<ReturnType<typeof thoughtSearchParamsSchema>>
