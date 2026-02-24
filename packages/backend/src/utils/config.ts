/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(5005),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default(
      process.env['NODE_ENV'] ? (process.env['NODE_ENV'] as 'development' | 'production' | 'test') : 'production'
    ),
  DATABASE_URL: z.string().default('file:./dev.db'),
  NAME_MIN_LENGTH: z.coerce.number().default(5),
  PASSWORD_MIN_LENGTH: z.coerce.number().default(12),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  THOUGHT_TITLE_MIN_LENGTH: z.coerce.number().default(5),
  THOUGHT_TITLE_MAX_LENGTH: z.coerce.number().default(254),
  THOUGHT_BODY_MIN_LENGTH: z.coerce.number().default(0),
  THOUGHT_BODY_MAX_LENGTH: z.coerce.number().default(65535),
  PAGE_SIZE_DEFAULT: z.coerce.number().default(25),
  PAGE_SIZE_MAXIMUM: z.coerce.number().default(100),
  JWT_SECRET: z.string().default('dave'),
  JWT_EXPIRES_IN: z.string().default('1h'),
})

export const config = schema.parse(process.env)
export default config
