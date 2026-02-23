/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { User } from '@prisma/client'
import { ConflictError, NotFoundError, ValidationError } from '../utils/error'
import { prisma } from '../utils/prisma.config'
import bcrypt from 'bcryptjs'
import logger from '../utils/logger'
import { createRegisterSchema, type RegisterInput } from '@brainwave/shared'
import { config } from '../utils/config'

const serviceLog = logger.child({ file: 'user.service.ts' })
export type SafeUser = Omit<User, 'password'>

function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line no-unused-vars
  const { password, ...safeUser } = user
  return safeUser
}

export async function createUser(input: RegisterInput): Promise<SafeUser> {
  const registerSchema = createRegisterSchema({
    minNameLength: config.NAME_MIN_LENGTH,
    minPasswordLength: config.PASSWORD_MIN_LENGTH,
  })
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    throw new ValidationError(`Invalid input: ${parsed.error.message}`)
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existingUser) {
    throw new ConflictError('User already exists')
  }

  const salt = bcrypt.genSaltSync(10)
  const hashed = bcrypt.hashSync(parsed.data.password, salt)
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
    },
  })
  const safeUser = toSafeUser(user)
  serviceLog.debug(`Created new user: ${JSON.stringify(safeUser)}`)
  return safeUser
}

export async function loginUser({ email, password }: { email: string; password: string }): Promise<SafeUser> {
  if (email == null || password == null) {
    throw new ValidationError('Please provide the email and password')
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new ValidationError('Invalid email or password')
  }

  const isValid = bcrypt.compareSync(password, user.password)
  if (!isValid) {
    throw new ValidationError('Invalid email or password')
  }

  const safeUser: SafeUser = toSafeUser(user)
  serviceLog.debug(`User logged in: ${JSON.stringify(safeUser)}`)
  return safeUser
}

export async function getUser(userId: number): Promise<SafeUser> {
  const user = (await prisma.user.findUnique({
    where: { userId },
    select: { userId: true, email: true, name: true, createdAt: true },
  })) as SafeUser

  if (!user) {
    throw new NotFoundError('User not found')
  }
  serviceLog.debug(`Fetched user: ${JSON.stringify(user)}`)
  return user
}
