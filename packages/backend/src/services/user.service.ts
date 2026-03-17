/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { User } from '@prisma/client'
import { ConflictError, NotFoundError, ValidationError } from '../utils/error'
import { prisma } from '../utils/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import logger from '../utils/logger'
import {
  type UserServerCreate,
  userServerCreateSchema,
  UserServerUpdate,
  userServerUpdateSchema,
} from '@brainwave/shared'
import { config } from '../utils/config'
import { sendConfirmationEmail } from '../utils/email'

const serviceLog = logger.child({ file: 'user.service.ts' })
export type SafeUser = Omit<User, 'password'>

function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line no-unused-vars
  const { password, ...safeUser } = user
  return safeUser
}

function getSchemaConfig() {
  return {
    minNameLength: config.NAME_MIN_LENGTH,
    minPasswordLength: config.PASSWORD_MIN_LENGTH,
  }
}

export async function createUser(input: UserServerCreate): Promise<SafeUser> {
  const registerSchema = userServerCreateSchema({
    minNameLength: config.NAME_MIN_LENGTH,
    minPasswordLength: config.PASSWORD_MIN_LENGTH,
  })
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
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
  // user.password can be null if 3rd party managed
  if (!user || user.password == null) {
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
  const user: SafeUser | null = await prisma.user.findUnique({
    where: { userId },
    select: { userId: true, email: true, name: true, createdAt: true, updatedAt: true, isConfirmed: true },
  })

  if (!user) {
    throw new NotFoundError('User not found')
  }
  serviceLog.debug(`Fetched user: ${JSON.stringify(user)}`)
  return user
}

export async function sendConfirmation(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { userId } })
  if (!user) {
    throw new NotFoundError('User not found')
  }
  if (user.isConfirmed) {
    serviceLog.warn(`Confirmed user ${user.email} attempted to resend confirmation`)
    throw new NotFoundError('User not found')
  }

  const confirmation = crypto.createHash('md5').update(user.createdAt.toString()).digest('hex')
  await sendConfirmationEmail(user.email, confirmation)
  serviceLog.debug(
    `Send email to ${user.email} with url ${config.FRONTEND_URL}confirm?email=${user.email}&token=${confirmation}`
  )
  return true
}

export async function getConfirmation(email: string, token: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new NotFoundError('User not found')
  }

  const confirmation = crypto.createHash('md5').update(user.createdAt.toString()).digest('hex')
  if (user.isConfirmed || confirmation !== token) {
    serviceLog.warn(`Potential attempt to get invalid confirmation for ${email}`)
    throw new NotFoundError('User not found')
  }
  await prisma.user.update({ where: { userId: user.userId }, data: { isConfirmed: true } })
  serviceLog.debug(`Confirmed token for ${user.email}`)
  return true
}

export async function updateUser(userData: UserServerUpdate): Promise<SafeUser> {
  const schema = userServerUpdateSchema(getSchemaConfig())
  const parsed = schema.safeParse(userData)
  if (!parsed.success) {
    throw new ValidationError('Invalid input', parsed.error)
  }
  const user = await prisma.user.findUnique({ where: { userId: parsed.data.userId } })
  if (user == null) {
    throw new NotFoundError('User not found')
  }
  user.updatedAt = new Date()
  if (parsed.data.email != null) {
    user.email = parsed.data.email
    user.isConfirmed = false
    serviceLog.debug(`Updating user ${user.userId} with new email ${user.email}`)
  }
  if (parsed.data.password != null) {
    const salt = bcrypt.genSaltSync(10)
    const hashed = bcrypt.hashSync(parsed.data.password, salt)
    user.password = hashed
    serviceLog.debug(`Updating user ${user.userId} with new password`)
  }
  if (parsed.data.name != null) {
    user.name = parsed.data.name
    serviceLog.debug(`Updated user ${user.userId} with new name ${user.name}`)
  }
  const { userId, ...updateData } = user
  const updatedUser = await prisma.user.update({ where: { userId }, data: updateData })
  serviceLog.debug(`Updated user ${user.userId}`)
  return toSafeUser(updatedUser)
}
