/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { User } from '@prisma/client'
import { config } from '../utils/config'
import { ConflictError, ValidationError } from '../utils/error'
import { prisma } from '../utils/prisma.config'
import bcrypt from 'bcryptjs'

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
      salt,
      password: hashed,
    },
  })
  return user
}
