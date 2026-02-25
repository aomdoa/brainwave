/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { PrismaClient, Status } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '../../src/utils/prisma'
import {
  createThought,
  updateThought,
  getThought,
  deleteThought,
  searchThoughts,
} from '../../src/services/thought.service'
import { NotFoundError, ValidationError } from '../../src/utils/error'

jest.mock('../../src/utils/prisma', () => ({
  ...jest.requireActual('../../src/utils/prisma'),
  prisma: mockDeep<PrismaClient>(),
}))

describe('thought.service', () => {
  let mockPrisma: DeepMockProxy<PrismaClient>

  const date = new Date('2026-01-01T00:00:00.000Z')

  const baseThought = {
    thoughtId: 1,
    userId: 10,
    title: 'Test title',
    body: 'Test body',
    status: Status.ACTIVE,
    nextReminder: date,
    createdAt: date,
    updatedAt: date,
    lastFollowUp: date,
  }

  beforeEach(() => {
    mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>
    jest.clearAllMocks()
  })

  describe('createThought', () => {
    const input = {
      userId: 10,
      title: 'Test title',
      body: 'Test body',
      status: Status.ACTIVE,
      nextReminder: date.toISOString(),
    }

    it('successful creation', async () => {
      mockPrisma.thought.create.mockResolvedValue(baseThought)

      const result = await createThought(input)

      expect(mockPrisma.thought.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: input.userId,
            title: input.title,
            body: input.body,
            status: input.status,
          }),
        })
      )

      expect(result).toEqual(baseThought)
    })

    it('invalid input', async () => {
      const bad = { ...input, title: '' }

      await expect(createThought(bad as any)).rejects.toThrow(ValidationError)
      expect(mockPrisma.thought.create).not.toHaveBeenCalled()
    })
  })

  describe('updateThought', () => {
    const input = {
      thoughtId: 1,
      userId: 10,
      title: 'Updated',
    }

    it('successful update', async () => {
      const updated = { ...baseThought, title: 'Updated' }
      mockPrisma.thought.update.mockResolvedValue(updated)

      const result = await updateThought(input)

      expect(mockPrisma.thought.update).toHaveBeenCalledWith({
        where: { thoughtId: input.thoughtId, userId: input.userId },
        data: { title: 'Updated' },
      })

      expect(result).toEqual(updated)
    })

    it('invalid input', async () => {
      const bad = { ...input, title: '' }

      await expect(updateThought(bad as any)).rejects.toThrow(ValidationError)
      expect(mockPrisma.thought.update).not.toHaveBeenCalled()
    })
  })

  describe('getThought', () => {
    it('successful get', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue(baseThought)

      const result = await getThought(1, 10)

      expect(mockPrisma.thought.findUnique).toHaveBeenCalledWith({
        where: { thoughtId: 1, userId: 10 },
      })

      expect(result).toEqual(baseThought)
    })

    it('not found', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue(null)

      await expect(getThought(1, 10)).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteThought', () => {
    it('successful delete', async () => {
      mockPrisma.thought.delete.mockResolvedValue(baseThought)

      const result = await deleteThought(1, 10)

      expect(mockPrisma.thought.delete).toHaveBeenCalledWith({
        where: { thoughtId: 1, userId: 10 },
      })

      expect(result).toEqual(baseThought)
    })

    it('not found', async () => {
      mockPrisma.thought.delete.mockResolvedValue(null as any)

      await expect(deleteThought(1, 10)).rejects.toThrow(NotFoundError)
    })
  })

  describe('searchThoughts', () => {
    const thoughts = [baseThought]

    it('successful search with pagination', async () => {
      const rawSearch = {
        page: 1,
        size: 10,
        search: 'test',
        orderBy: 'createdAt:asc',
        filter: "status eq 'ACTIVE'",
      }

      mockPrisma.$transaction.mockResolvedValue([thoughts, 1] as any)

      const result = await searchThoughts(rawSearch, 10)

      expect(mockPrisma.$transaction).toHaveBeenCalled()

      const txArgs = mockPrisma.$transaction.mock.calls[0][0]
      expect(txArgs).toHaveLength(2)

      expect(result.data).toEqual(thoughts)

      expect(result.page).toEqual({
        current: 1,
        size: 1,
        totalElements: 1,
        totalPages: 1,
      })
    })

    it('invalid search input', async () => {
      const bad = { page: -1 }

      await expect(searchThoughts(bad, 10)).rejects.toThrow(ValidationError)
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })
  })
})
