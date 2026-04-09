/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

// thought history
export const thoughtHistorySchema = z.object({
  thoughtBodyHistoryId: z.number().positive(),
  thoughtId: z.number().positive(),
  body: z.string(),
  createdAt: z.iso.datetime(),
})

export const thoughtHistoryServerSchema = thoughtHistorySchema.strict()
export const thoughtHistoryClientSchema = thoughtHistorySchema.strip()
export type ThoughtHistoryServer = z.output<typeof thoughtHistoryServerSchema>
export type ThoughtHistoryClient = z.output<typeof thoughtHistoryClientSchema>
