/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import mockLogger from '../__mocks__/logger'
import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '../../src/utils/prisma'
import {
  createUser,
  getConfirmation,
  getUser,
  loginUser,
  sendConfirmation,
  updateUser,
} from '../../src/services/user.service'
import { ConflictError, NotFoundError, ValidationError } from '../../src/utils/error'
import { sendConfirmationEmail } from '../../src/utils/email'
import bcrypt from 'bcryptjs'
import { UserValidLength } from '@brainwave/shared'

jest.mock('../../src/utils/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

jest.mock('bcryptjs', () => ({
  ...jest.requireActual('bcryptjs'),
  compareSync: jest.fn(),
}))

jest.mock('../../src/utils/email', () => ({
  sendConfirmationEmail: jest.fn(),
}))

jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: mockLogger,
}))

describe('user.service', () => {
  const input = {
    name: 'user name',
    email: 'email@email.com',
    password: 'password',
    confirmPassword: 'password',
    authLength: '6h' as UserValidLength,
  }
  const date = new Date('2008-12-10T04:03:45.12Z')
  const output = {
    name: input.name,
    userId: 1,
    email: input.email,
    createdAt: date,
    updatedAt: date,
    isConfirmed: true,
    authLength: '6h',
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
        select: {
          userId: true,
          email: true,
          isConfirmed: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          authLength: true,
        },
      })
    })

    it('missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(getUser(1)).rejects.toThrow(NotFoundError)
    })
  })

  describe('sendConfirmation', () => {
    it('proper sending', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...output, isConfirmed: false } as any)
      const mockSendConfirmationEmail = sendConfirmationEmail as jest.Mock
      mockSendConfirmationEmail.mockResolvedValue({})
      const result = await sendConfirmation(1)
      expect(result).toBeTruthy()
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Send email to email@email.com with url https://localhost:5173/confirm?email=email@email.com&token=9bd8af670f2eea9b5039cf9cffae0005'
      )
    })

    it('no user found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      expect(sendConfirmation(1)).rejects.toThrow(NotFoundError)
    })

    it('user is already confirmed', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(output as any)
      await expect(sendConfirmation(1)).rejects.toThrow(NotFoundError)
      expect(mockLogger.warn).toHaveBeenCalledWith('Confirmed user email@email.com attempted to resend confirmation')
    })

    it('failed to send', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...output, isConfirmed: false } as any)
      const mockSendConfirmationEmail = sendConfirmationEmail as jest.Mock
      mockSendConfirmationEmail.mockRejectedValue(new Error('failed'))
      const result = await sendConfirmation(1)
      expect(result).toBeFalsy()
      expect(mockLogger.warn).toHaveBeenCalledWith('Unable to send email for 1 to email@email.com: failed')
    })
  })

  describe('getConfirmation', () => {
    it('proper validation', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...output, isConfirmed: false } as any)
      mockPrisma.user.update.mockResolvedValue(output as any)
      const result = await getConfirmation('email@email.com', '9bd8af670f2eea9b5039cf9cffae0005')
      expect(result).toBeTruthy()
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'email@email.com' } })
      expect(mockPrisma.user.update).toHaveBeenCalledWith({ data: { isConfirmed: true }, where: { userId: 1 } })
    })

    it('no user found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(getConfirmation('notexist@email.com', 'code')).rejects.toThrow(NotFoundError)
    })

    it('user is already confirmed', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(output as any)
      await expect(getConfirmation('email@email.com', 'confirmation')).rejects.toThrow(NotFoundError)
      expect(mockLogger.warn).toHaveBeenCalledWith('Potential attempt to get invalid confirmation for email@email.com')
    })
  })

  describe('updateUser', () => {
    it('full user update', async () => {
      const update = { userId: 1, ...input }
      mockPrisma.user.findUnique.mockResolvedValue(output as any)
      mockPrisma.user.update.mockResolvedValue(output as any)
      const user = await updateUser(update)
      expect(+user.updatedAt).toBeGreaterThan(+date)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { userId: 1 } })
      expect(mockPrisma.user.update).toHaveBeenLastCalledWith({
        where: { userId: 1 },
        data: expect.objectContaining({
          email: 'email@email.com',
          isConfirmed: false,
          name: 'user name',
        }),
      })
    })

    it('no update', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(output as any)
      mockPrisma.user.update.mockResolvedValue(output as any)
      const user = await updateUser({ userId: 1, authLength: '1h' })
      expect(+user.updatedAt).toBeGreaterThan(+date)
      expect(mockPrisma.user.update).toHaveBeenLastCalledWith({
        where: { userId: 1 },
        data: expect.objectContaining({
          email: 'email@email.com',
          isConfirmed: false,
          name: 'user name',
        }),
      })
    })

    it('no access', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(updateUser({ name: '1' } as any)).rejects.toThrow(ValidationError)
      await expect(updateUser({ userId: 1, authLength: '1h' })).rejects.toThrow(NotFoundError)
    })
  })
})
