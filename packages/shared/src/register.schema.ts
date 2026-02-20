/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

export interface RegisterConfig {
  minNameLength: number
  minPasswordLength: number
}

export const createRegisterSchema = (config: RegisterConfig) =>
  z
    .object({
      name: z.string().min(config.minNameLength),
      email: z.email(),
      password: z.string().min(config.minPasswordLength),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>
