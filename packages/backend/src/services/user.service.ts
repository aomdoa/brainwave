/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { User } from '@prisma/client'
import { config } from '../utils/config'
import { ConflictError, NotFoundError, ValidationError } from '../utils/error'
import { prisma } from '../utils/prisma.config'
import bcrypt from 'bcryptjs'
import logger from '../utils/logger'

const serviceLog = logger.child({ file: 'user.service.ts' })
export type SafeUser = Omit<User, 'password'>

export async function createUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}): Promise<User> {
  if (!name || !email || !password) {
    throw new ValidationError('Name, email, and password are required')
  }

  if (password.length < config.PASSWORD_MIN_LENGTH) {
    throw new ValidationError(`Password must be at least ${config.PASSWORD_MIN_LENGTH} characters long`)
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new ConflictError('User already exists')
  }

  const salt = bcrypt.genSaltSync(10)
  const hashed = bcrypt.hashSync(password, salt)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  })
  serviceLog.debug(`Created new user: ${JSON.stringify(user)}`)
  return user
}

export async function loginUser({ email, password }: { email: string; password: string }): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new ValidationError('Invalid email or password')
  }

  const isValid = bcrypt.compareSync(password, user.password)
  if (!isValid) {
    throw new ValidationError('Invalid email or password')
  }

  const safeUser: SafeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
  serviceLog.debug(`User logged in: ${JSON.stringify(safeUser)}`)
  return safeUser
}

export async function getUser(userId: number): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  if (!user) {
    throw new NotFoundError('User not found')
  }
  serviceLog.debug(`Fetched user: ${JSON.stringify(user)}`)
  return user as SafeUser
}
