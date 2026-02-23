/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

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
