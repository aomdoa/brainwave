/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.string().default('http://localhost:5005'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export const config = schema.parse(import.meta.env)
export default config
