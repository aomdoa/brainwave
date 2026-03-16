/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { z } from 'zod'

export interface UserConfig {
  minNameLength: number
  minPasswordLength: number
}

// core users
export const userBaseSchema = z.object({
  name: z.string(),
  email: z.email(),
  isConfirmed: z.boolean().default(false),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export const userServerSchema = userBaseSchema
  .extend({
    userId: z.number().positive(),
  })
  .strict()
export const userClientSchema = userBaseSchema.strip()
export type UserServer = z.infer<typeof userServerSchema>
export type UserClient = z.infer<typeof userClientSchema>

// creation of users
export const userBaseCreateSchema = (config: UserConfig) =>
  z
    .object({
      name: z.string().min(config.minNameLength),
      email: z.email(),
      password: z.string().min(config.minPasswordLength),
      confirmPassword: z.string(),
      isConfirmed: z.boolean().optional(),
    })
    .refine((data) => data.password != null && data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
export const userServerCreateSchema = (config: UserConfig) => userBaseCreateSchema(config).strict()
export const userClientCreateSchema = (config: UserConfig) => userBaseCreateSchema(config).strip()
export type UserServerCreate = z.infer<ReturnType<typeof userServerCreateSchema>>
export type UserClientCreate = z.infer<ReturnType<typeof userClientCreateSchema>>

// update of the users
export const userBaseUpdateSchema = userBaseCreateSchema
export const userServerUpdateSchema = (config: UserConfig) =>
  userBaseUpdateSchema(config)
    .extend({
      userId: z.number().positive(),
    })
    .strict()
export const userClientUpdateSchema = userBaseUpdateSchema
export type UserServerUpdate = z.infer<ReturnType<typeof userServerUpdateSchema>>
export type UserClientUpdate = z.infer<ReturnType<typeof userClientUpdateSchema>>
