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
  CORS_ORIGIN: z.string().default('https://localhost:5173'),
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
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5005/user/google/callback'),
  FRONTEND_URL: z.string().default('https://localhost:5173/'),
  VAPID_PUBLIC_KEY: z.string(),
  VAPID_PRIVATE_KEY: z.string(),
  VAPID_EMAIL: z.string().default('mailto:aomdoa@gmail.com'),
  SMTP_FROM: z.email().default('info@aomdoa.ca'),
  SMTP_HOST: z.string().default('mailroot8.namespro.ca'),
  SMTP_PORT: z.number().default(587),
  SMTP_USER: z.string().default('smtp user'),
  SMTP_PASS: z.string().default('smtp pass'),
})

export const config = schema.parse(process.env)
export default config
