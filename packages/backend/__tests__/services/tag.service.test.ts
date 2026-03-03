/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { PrismaClient, Status } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '../../src/utils/prisma'
import { createTag, updateTag, getTag, getTags, getTagByName, deleteTag } from '../../src/services/tag.service'
import { NotFoundError, ValidationError } from '../../src/utils/error'

jest.mock('../../src/utils/prisma', () => ({
  ...jest.requireActual('../../src/utils/prisma'),
  prisma: mockDeep<PrismaClient>(),
}))

describe('tag.service', () => {
  let mockPrisma: DeepMockProxy<PrismaClient>

  const date = new Date('2026-01-01T00:00:00.000Z')

  const baseTag = {
    tagId: 1,
    name: 'Tag Name',
    notes: 'Notes',
    userId: 5,
    createdAt: date,
    updatedAt: date,
  }

  beforeEach(() => {
    mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>
    jest.clearAllMocks()
  })

  describe('createTag', () => {
    const input = {
      userId: 10,
      name: 'Tag Name',
      notes: 'Notes',
    }

    it('successful creation', async () => {
      mockPrisma.tag.create.mockResolvedValue(baseTag)

      const result = await createTag(input)

      expect(mockPrisma.tag.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: input.userId,
            name: input.name,
          }),
        })
      )

      expect(result).toEqual(baseTag)
    })

    it('invalid input', async () => {
      const bad = { ...input, name: '' }

      await expect(createTag(bad as any)).rejects.toThrow(ValidationError)
      expect(mockPrisma.tag.create).not.toHaveBeenCalled()
    })
  })

  describe('updateTag', () => {
    const input = {
      tagId: 1,
      userId: 10,
      name: 'Updated',
    }

    it('successful update', async () => {
      const updated = { ...baseTag, title: 'Updated' }
      mockPrisma.tag.update.mockResolvedValue(updated)

      const result = await updateTag(input)

      expect(mockPrisma.tag.update).toHaveBeenCalledWith({
        where: { tagId: input.tagId, userId: input.userId },
        data: expect.objectContaining({ name: 'Updated' }),
      })

      expect(result).toEqual(updated)
    })

    it('invalid input', async () => {
      const bad = { ...input, name: '' }

      await expect(updateTag(bad as any)).rejects.toThrow(ValidationError)
      expect(mockPrisma.tag.update).not.toHaveBeenCalled()
    })
  })

  describe('getTag', () => {
    it('successful get', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(baseTag)

      const result = await getTag(1, 10)

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { tagId: 1, userId: 10 },
      })

      expect(result).toEqual(baseTag)
    })

    it('not found', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(null)

      await expect(getTag(1, 10)).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteTag', () => {
    it('successful delete', async () => {
      mockPrisma.tag.delete.mockResolvedValue(baseTag)

      const result = await deleteTag(1, 10)

      expect(mockPrisma.tag.delete).toHaveBeenCalledWith({
        where: { tagId: 1, userId: 10 },
      })

      expect(result).toEqual(baseTag)
    })

    it('not found', async () => {
      mockPrisma.tag.delete.mockResolvedValue(null as any)

      await expect(deleteTag(1, 10)).rejects.toThrow(NotFoundError)
    })
  })

  describe('getTagByName', () => {
    it('successful get', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(baseTag)

      const result = await getTagByName('Tag Name', 10)
      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { userId_name: { name: 'Tag Name', userId: 10 } },
      })
      expect(result).toEqual(baseTag)
    })

    it('not found', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(null)

      const result = await getTagByName('Tag Name', 10)
      expect(result).toBeNull()
    })
  })

  describe('getTags', () => {
    it('simple list', async () => {
      mockPrisma.tag.findMany.mockResolvedValue([baseTag])

      const result = await getTags(10)

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: { userId: 10 },
      })

      expect(result).toEqual([baseTag])
    })
  })
})
