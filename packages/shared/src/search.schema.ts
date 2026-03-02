/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

export const VALID_SEARCH_OPERATORS = ['eq', 'ne', 'gt', 'ge', 'lt', 'le'] as const
export const VALID_SEARCH_LOGICALS = ['and', 'or'] as const

export type SearchOperators = (typeof VALID_SEARCH_OPERATORS)[number]
export type SearchLogicals = (typeof VALID_SEARCH_LOGICALS)[number]

export interface SearchResultConfig {
  pageSizeMaximum: number
  pageSizeDefault: number
}

// search results
export const searchPageSchema = z
  .object({
    current: z.number().int().positive(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  })
  .strict()

export const searchLinksSchema = z
  .object({
    self: z.url(),
    first: z.url(),
    last: z.url(),
    next: z.url().nullable(),
    prev: z.url().nullable(),
  })
  .strict()

export type SearchPage = z.infer<typeof searchPageSchema>
export type SearchLinks = z.infer<typeof searchLinksSchema>

// Simple search schema that can be used by the ui
export const searchOrderSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']),
})

export const searchFilterSchema = z.object({
  field: z.string(),
  operator: z.enum(VALID_SEARCH_OPERATORS),
  value: z.string(),
  logical: z.enum(VALID_SEARCH_LOGICALS),
})

export const searchClientSchema = z.object({
  page: z.number().optional(),
  size: z.number().optional(),
  orderBy: searchOrderSchema.optional(),
  search: z.string().optional(),
  filter: z.array(searchFilterSchema).optional(),
})
export type SearchOrder = z.infer<typeof searchOrderSchema>
export type SearchFilter = z.infer<typeof searchFilterSchema>
export type SearchClientSchema = z.infer<typeof searchClientSchema>

// search request only the backend should use this - includes parsing of the data
export const searchSchema = (
  config: SearchResultConfig,
  filters: string[],
  orders: string[],
  defaultOrder = 'updatedAt'
) =>
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(config.pageSizeMaximum).default(config.pageSizeDefault),
    orderBy: orderBySchema(orders, defaultOrder),
    search: z.string().trim().min(1).optional(),
    filter: filterSchema(filters),
  })

export const orderBySchema = (orders: string[], defaultOrder = 'updatedAt') =>
  z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value) {
        return { field: defaultOrder, direction: 'desc' } as const
      }

      const parts = value.split(':')
      if (parts.length === 1) {
        parts.push('desc')
      }
      const [field, direction] = parts

      if (!orders.includes(field)) {
        ctx.addIssue({
          code: 'custom',
          path: ['orderBy'],
          message: `Invalid order field: ${field}`,
        })
        return z.NEVER
      }

      if (direction !== 'asc' && direction !== 'desc') {
        ctx.addIssue({
          code: 'custom',
          path: ['orderBy'],
          message: 'Direction must be asc or desc',
        })
        return z.NEVER
      }

      return {
        field: field,
        direction: direction as 'asc' | 'desc',
      }
    })

export const filterSchema = (filters: string[]) =>
  z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value) return undefined

      /**
       * Take this: filter=status eq ACTIVE and createdAt gt 2026-01-01
       * Make it this: [
       *  {field: 'status', operator: 'eq', value: 'ACTIVE', logical: 'and'},
       *  {field: 'createdAt', operator: 'ge', value: '2026-01-01', logical: 'and'}
       * ]
       */
      try {
        const regex = new RegExp(`\\s+\\b(${VALID_SEARCH_LOGICALS.join('|')})\\b\\s+`, 'i')
        const tokens = value.split(regex)
        const conditions: SearchFilter[] = []
        let logical = 'and'

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i].trim()
          const lowerCaseToken = token.toLowerCase()
          if (VALID_SEARCH_LOGICALS.includes(lowerCaseToken as SearchLogicals)) {
            logical = lowerCaseToken
            continue
          }

          const parts = token.split(/\s+/)
          if (parts.length !== 3) {
            throw new Error(`Invalid filter expression: ${token}`)
          }

          const [field, op, rawValue] = parts
          if (!filters.includes(field)) {
            throw new Error(`Invalid filter field: ${field}`)
          }
          if (!VALID_SEARCH_OPERATORS.includes(op as SearchOperators)) {
            throw new Error(`Invalid operator: ${op}`)
          }

          const valueParsed = rawValue.replace(/^'|'$/g, '')

          conditions.push({
            field,
            operator: op as SearchOperators,
            value: valueParsed,
            logical: logical as SearchLogicals,
          })
        }
        return conditions
      } catch (err: any) {
        ctx.addIssue({
          code: 'custom',
          path: ['filter'],
          message: err.message || 'Invalid filter',
        })
        return z.NEVER
      }
    })
