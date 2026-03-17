/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { PrismaClient, Status } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '../../src/utils/prisma'
import { createHistory, getHistory } from '../../src/services/history.service'

jest.mock('../../src/utils/prisma', () => ({
  ...jest.requireActual('../../src/utils/prisma'),
  prisma: mockDeep<PrismaClient>(),
}))

describe('history.service', () => {
  let mockPrisma: DeepMockProxy<PrismaClient>

  beforeEach(() => {
    mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>
    jest.clearAllMocks()
  })

  describe('createHistory', () => {
    it('creates history when body is present', async () => {
      const mockHistory = {
        thoughtBodyHistoryId: 1,
        thoughtId: 5,
        body: 'test body',
        createdAt: new Date(),
      }

      mockPrisma.thoughtBodyHistory.create.mockResolvedValue(mockHistory)
      const result = await createHistory(5, 'test body')
      expect(mockPrisma.thoughtBodyHistory.create).toHaveBeenCalledWith({
        data: {
          thoughtId: 5,
          body: 'test body',
        },
      })

      expect(result).toEqual(mockHistory)
    })

    it('ensure nothing done if body is empty', async () => {
      const result = await createHistory(2, '')
      expect(result).toBeNull()
    })
  })

  describe('getHistory', () => {
    it('returns histories for a thought', async () => {
      const mockHistories = [
        {
          thoughtBodyHistoryId: 1,
          thoughtId: 5,
          body: 'first',
          createdAt: new Date(),
        },
        {
          thoughtBodyHistoryId: 2,
          thoughtId: 5,
          body: 'second',
          createdAt: new Date(),
        },
      ]

      mockPrisma.thoughtBodyHistory.findMany.mockResolvedValue(mockHistories)

      const result = await getHistory(5)

      expect(mockPrisma.thoughtBodyHistory.findMany).toHaveBeenCalledWith({
        where: { thoughtId: 5 },
        orderBy: { createdAt: 'desc' },
      })

      expect(result).toEqual(mockHistories)
    })
  })
})
