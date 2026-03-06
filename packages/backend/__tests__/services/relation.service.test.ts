/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { PrismaClient, RelationType } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '../../src/utils/prisma'
import { ValidationError } from '../../src/utils/error'

import {
  getThoughtRelations,
  addThoughtRelations,
  remThoughtRelations,
  setThoughtRelations,
} from '../../src/services/relation.service'

jest.mock('../../src/utils/prisma', () => ({
  ...jest.requireActual('../../src/utils/prisma'),
  prisma: mockDeep<PrismaClient>(),
}))

describe('relation.service', () => {
  let mockPrisma: DeepMockProxy<PrismaClient>

  beforeEach(() => {
    mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>
    jest.clearAllMocks()
  })

  describe('getThoughtRelations', () => {
    it('throws ValidationError if thought not found', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue(null)

      await expect(getThoughtRelations(1, 10)).rejects.toThrow(ValidationError)
    })

    it('returns mapped relations', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue({ thoughtId: 1 } as any)

      mockPrisma.thoughtRelation.findMany.mockResolvedValue([
        {
          thoughtRelationId: 100,
          relationType: RelationType.RELATED,
          thoughtOneId: 1,
          thoughtTwoId: 2,
          createdAt: new Date('2025-01-01'),
          thoughtOne: { thoughtId: 1 },
          thoughtTwo: { thoughtId: 2 },
        } as any,
      ])

      const result = await getThoughtRelations(1, 10)

      expect(result).toEqual([
        {
          thoughtRelationId: 100,
          relationType: RelationType.RELATED,
          createdAt: new Date('2025-01-01').toISOString(),
          thought: { thoughtId: 2 },
        },
      ])
    })
  })

  describe('addThoughtRelations', () => {
    it('throws ValidationError if main thought invalid', async () => {
      mockPrisma.thoughtRelation.findMany.mockResolvedValue([])

      mockPrisma.thought.findMany.mockResolvedValue([])

      await expect(addThoughtRelations(1, [2, 3], 10)).rejects.toThrow(ValidationError)
    })

    it('creates relations for valid thoughts', async () => {
      mockPrisma.thoughtRelation.findMany.mockResolvedValue([])

      mockPrisma.thought.findMany.mockResolvedValue([{ thoughtId: 1 }, { thoughtId: 2 }] as any)

      mockPrisma.thoughtRelation.createMany.mockResolvedValue({ count: 1 })

      mockPrisma.thought.findUnique.mockResolvedValue({ thoughtId: 1 } as any)
      mockPrisma.thoughtRelation.findMany.mockResolvedValue([])

      const result = await addThoughtRelations(1, [2], 10)

      expect(mockPrisma.thoughtRelation.createMany).toHaveBeenCalledWith({
        data: [
          {
            relationType: RelationType.RELATED,
            thoughtOneId: 1,
            thoughtTwoId: 2,
          },
        ],
      })

      expect(result).toBeDefined()
    })
  })

  describe('remThoughtRelations', () => {
    it('throws ValidationError if thought not found', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue(null)

      await expect(remThoughtRelations(1, [2], 10)).rejects.toThrow(ValidationError)
    })

    it('removes matching relations', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue({ thoughtId: 1 } as any)

      mockPrisma.thoughtRelation.findMany.mockResolvedValue([
        {
          thoughtRelationId: 20,
          thoughtOneId: 1,
          thoughtTwoId: 2,
          createdAt: new Date('1982-08-30 12:53:12'),
        },
      ] as any)

      mockPrisma.thoughtRelation.deleteMany.mockResolvedValue({ count: 1 })

      const result = await remThoughtRelations(1, [2], 10)

      expect(mockPrisma.thoughtRelation.deleteMany).toHaveBeenCalledWith({
        where: { thoughtRelationId: { in: [20] } },
      })

      expect(result).toBeDefined()
    })
  })

  describe('setThoughtRelations', () => {
    it('throws ValidationError if thought not found', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue(null)

      await expect(setThoughtRelations(1, [2], 10)).rejects.toThrow(ValidationError)
    })

    it('replaces existing relations', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue({ thoughtId: 1 } as any)

      mockPrisma.thoughtRelation.deleteMany.mockResolvedValue({ count: 2 })

      mockPrisma.thoughtRelation.findMany.mockResolvedValue([])

      mockPrisma.thought.findMany.mockResolvedValue([{ thoughtId: 1 }, { thoughtId: 2 }] as any)

      mockPrisma.thoughtRelation.createMany.mockResolvedValue({ count: 1 })

      const result = await setThoughtRelations(1, [2], 10)

      expect(mockPrisma.thoughtRelation.deleteMany).toHaveBeenCalled()

      expect(mockPrisma.thoughtRelation.createMany).toHaveBeenCalled()

      expect(result).toBeDefined()
    })
  })
})
