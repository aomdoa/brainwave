/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

// thought history
export const thoughtHistoryBaseSchema = z.object({
  thoughtBodyHistoryId: z.number().positive(),
  thoughtId: z.number().positive(),
  body: z.string(),
  createdAt: z.iso.datetime(),
})

export const thoughtHistoryServerSchema = thoughtHistoryBaseSchema.strict()
export const thoughtHistoryClientSchema = thoughtHistoryBaseSchema.strip()
export type ThoughtHistoryServer = z.infer<typeof thoughtHistoryServerSchema>
export type ThoughtHistoryClient = z.infer<typeof thoughtHistoryClientSchema>
