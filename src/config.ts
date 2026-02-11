/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(5005),
})

export const config = schema.parse(process.env)
