/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.string().default('http://localhost:5005'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  VITE_VAPID_PUBLIC: z
    .string()
    .default('BKJbzj5jLlstRCkH9E_N3O58s8Zg-A1F1fBSKopCMUMm9ZGK27hz2yIslW0wW-lFnFE6r99gTAKYZW0MCR3ZJk4'),
})

export const config = schema.parse(import.meta.env)
export default config
