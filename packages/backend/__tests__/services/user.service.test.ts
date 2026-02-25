/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '../../src/utils/prisma'
import { createUser, getUser, loginUser } from '../../src/services/user.service'
import { ConflictError, NotFoundError, ValidationError } from '../../src/utils/error'
import bcrypt from 'bcryptjs'

jest.mock('../../src/utils/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

jest.mock('bcryptjs', () => ({
  ...jest.requireActual('bcryptjs'),
  compareSync: jest.fn(),
}))

describe('user.service', () => {
  const input = {
    name: 'user name',
    email: 'email@email.com',
    password: 'password',
    confirmPassword: 'password',
  }
  const date = new Date('2008-12-10T04:03:45.12Z')
  const output = {
    name: input.name,
    userId: 1,
    email: input.email,
    createdAt: date,
    updatedAt: date,
  }

  let mockPrisma: DeepMockProxy<PrismaClient>
  let validationErrors: { field: string; issue: string }[] = []

  beforeEach(() => {
    mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>
    validationErrors = []
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('successful creation', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({ ...output, password: 'salted password' })

      const user = await createUser(input)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: input.email } })
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { name: input.name, email: input.email, password: expect.any(String) },
      })
      expect(user).toEqual(output)
    })

    it('block on invalid', async () => {
      const failedUser = { ...input, confirmPassword: 'this is not valid' }
      await createUser(failedUser).catch((err) => {
        const error = err as ValidationError
        validationErrors = error.details ?? []
      })
      expect(validationErrors.length).toBe(1)
      expect(validationErrors[0].issue).toBe('Passwords do not match')
    })

    it('already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...output, password: 'password' })
      await expect(createUser(input)).rejects.toThrow(ConflictError)
    })
  })

  describe('loginUser', () => {
    const loginData = { email: 'email@email.com', password: 'password' }
    it('successful login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...output, password: 'crypted pass' })
      ;(bcrypt.compareSync as jest.Mock).mockReturnValue(true)
      const user = await loginUser(loginData)
      expect(user).toEqual(output)
    })

    it('missing params', async () => {
      await expect(loginUser({ email: undefined, password: 'password' } as any)).rejects.toThrow(ValidationError)
    })

    it('missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(loginUser(loginData)).rejects.toThrow(ValidationError)
    })

    it('bad password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...output, password: 'crypted pass' })
      ;(bcrypt.compareSync as jest.Mock).mockReturnValue(false)
      await expect(loginUser(loginData)).rejects.toThrow(ValidationError)
    })
  })

  describe('getUser', () => {
    it('successful get', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(output as any)
      const user = await getUser(1)
      expect(user).toEqual(output)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: { userId: true, email: true, name: true, createdAt: true, updatedAt: true },
      })
    })

    it('missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(getUser(1)).rejects.toThrow(NotFoundError)
    })
  })
})
