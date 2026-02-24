/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'
import { SearchResultConfig, searchSchema } from './search.schema'

export interface ThoughtConfig {
  minTitleLength: number
  maxTitleLength: number
  minBodyLength: number
  maxBodyLength: number
}

const status = ['ACTIVE', 'INACTIVE', 'CLOSED'] as const

export const createThoughtSchema = (config: ThoughtConfig) =>
  z.object({
    title: z.string().min(config.minTitleLength).max(config.maxTitleLength).trim(),
    body: z.string().min(config.minBodyLength).max(config.maxBodyLength).trim(),
    status: z.enum(status),
    nextReminder: z.iso.datetime().optional().nullable(),
    userId: z.number().positive(),
  })

export type ThoughtInput = z.infer<ReturnType<typeof createThoughtSchema>>

export const THOUGHT_SEARCH_FILTERS = ['status', 'createdAt', 'lastUpdated', 'lastFollowUp', 'nextReminder']
export const THOUGHT_SEARCH_ORDERS = ['title', ...THOUGHT_SEARCH_FILTERS]

export const createThoughtSearchSchema = (config: SearchResultConfig) =>
  searchSchema(config, THOUGHT_SEARCH_FILTERS, THOUGHT_SEARCH_ORDERS)

export type ThoughtSearch = z.infer<ReturnType<typeof createThoughtSearchSchema>>
