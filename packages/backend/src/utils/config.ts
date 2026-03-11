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
  TITLE_MIN_LENGTH: z.coerce.number().default(5),
  TITLE_MAX_LENGTH: z.coerce.number().default(254),
  BODY_MIN_LENGTH: z.coerce.number().default(0),
  BODY_MAX_LENGTH: z.coerce.number().default(65535),
  PAGE_SIZE_DEFAULT: z.coerce.number().default(25),
  PAGE_SIZE_MAXIMUM: z.coerce.number().default(100),
  JWT_SECRET: z.string().default('dave'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  DOCS_BASE: z.string().default('/'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5005/auth/google/callback'),
  FRONTEND_URL: z.string().default('http://localhost:5173/brainwave'),
  VAPID_PUBLIC_KEY: z
    .string()
    .default('BKJbzj5jLlstRCkH9E_N3O58s8Zg-A1F1fBSKopCMUMm9ZGK27hz2yIslW0wW-lFnFE6r99gTAKYZW0MCR3ZJk4'),
  VAPID_PRIVATE_KEY: z.string().default('RrIfnxBSHJ2Yajp2ewoVpiGyBCw6HCXFIhytnx0gsN4'),
})

export const config = schema.parse(process.env)
export default config
