/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

export interface UserConfig {
  minNameLength: number
  minPasswordLength: number
}

export const userAuthLength = ['1h', '6h', '1d', '7d', '30d'] as const
export type UserValidLength = (typeof userAuthLength)[number]

export const userSchema = z.object({
  name: z.string(),
  email: z.email(),
  isConfirmed: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  authLength: z.enum(userAuthLength),
})
export const userServerSchema = userSchema
  .extend({
    pk: z.string(),
    sk: z.string(),
    userId: z.uuid(),
  })
  .strict()
export const userClientSchema = userSchema
export type UserServerRecord = z.output<typeof userServerSchema> // what the server sees
export type UserClientRecord = z.output<typeof userClientSchema> // what the client sees

// input for creating users
export const userCreateSchema = (config: UserConfig) =>
  z
    .object({
      name: z.string().min(config.minNameLength),
      email: z.email(),
      password: z.string().min(config.minPasswordLength),
      confirmPassword: z.string(),
      isConfirmed: z.boolean().optional().default(false),
      authLength: z.enum(userAuthLength).optional().default('6h'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
    .strict()
export type UserCreateRequest = z.input<ReturnType<typeof userCreateSchema>>

// update of the users
export const userUpdateSchema = (config: UserConfig) =>
  z
    .object({
      name: z.string().min(config.minNameLength).optional(),
      email: z.email().optional(),
      password: z.string().min(config.minPasswordLength).optional(),
      confirmPassword: z.string().optional(),
      isConfirmed: z.boolean().optional(),
      authLength: z.enum(userAuthLength).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
    .strict()
export type UserUpdateRequest = z.input<ReturnType<typeof userUpdateSchema>>
