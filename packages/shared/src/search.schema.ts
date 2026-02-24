/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

export const VALID_SEARCH_OPERATORS = ['eq', 'ne', 'gt', 'ge', 'lt', 'le'] as const
export const VALID_SEARCH_LOGICALS = ['and', 'or'] as const

export type SearchOperators = (typeof VALID_SEARCH_OPERATORS)[number]
export type SearchLogicals = (typeof VALID_SEARCH_LOGICALS)[number]

export type FilterCondition = {
  field: string
  operator: SearchOperators
  value: string
  logical: SearchLogicals
}

export interface SearchRequest {
  page: number | undefined
  size: number | undefined
  orderBy: string | undefined
  search: string | undefined
  filter: string | undefined
}

export interface SearchPageResults {
  current: number
  size: number
  totalElements: number
  totalPages: number
}

export interface SearchResultConfig {
  pageSizeMaximum: number
  pageSizeDefault: number
}

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
        const conditions: FilterCondition[] = []
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
