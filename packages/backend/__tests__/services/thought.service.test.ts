/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { PrismaClient, Status, Tag, Thought } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { prisma } from '../../src/utils/prisma'
import {
  createThought,
  updateThought,
  getThought,
  deleteThought,
  searchThoughts,
  touchThought,
  updateThoughtTags,
  addThoughtTag,
  remThoughtTag,
} from '../../src/services/thought.service'
import { baseThought, date, makeTag, makeTags, makeThought } from '../data.factory'
import { getTag, getTagsByIds } from '../../src/services/tag.service'
import { createHistory } from '../../src/services/history.service'
import { NotFoundError, ValidationError } from '../../src/utils/error'

jest.mock('../../src/utils/prisma', () => ({
  ...jest.requireActual('../../src/utils/prisma'),
  prisma: mockDeep<PrismaClient>(),
}))

jest.mock('../../src/services/tag.service', () => ({
  getTagsByIds: jest.fn(),
  getTag: jest.fn(),
}))

jest.mock('../../src/services/history.service', () => ({
  createHistory: jest.fn(),
}))

describe('thought.service', () => {
  let mockPrisma: DeepMockProxy<PrismaClient>

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
        data: expect.objectContaining({ title: 'Updated' }),
      })

      expect(result).toEqual(updated)
    })

    it('invalid input', async () => {
      const bad = { ...input, title: '' }

      await expect(updateThought(bad as any)).rejects.toThrow(ValidationError)
      expect(mockPrisma.thought.update).not.toHaveBeenCalled()
    })

    it('update thought body', async () => {
      const bodyInput = { ...baseThought, body: 'Updated body...' }
      mockPrisma.thought.update.mockResolvedValue(bodyInput)
      mockPrisma.thought.findUnique.mockResolvedValue(baseThought)
      const mockCreateHistory = createHistory as jest.Mock
      mockCreateHistory.mockResolvedValue(null)
      const result = await updateThought({ thoughtId: 1, userId: 10, body: 'Updated body...' })

      expect(mockPrisma.thought.update).toHaveBeenCalledWith({
        where: { thoughtId: input.thoughtId, userId: input.userId },
        data: expect.objectContaining({ body: 'Updated body...' }),
      })
      expect(mockCreateHistory).toHaveBeenCalledWith(1, 'Test body')

      expect(result).toEqual(bodyInput)
    })
  })

  describe('getThought', () => {
    it('successful get', async () => {
      mockPrisma.thought.findUnique.mockResolvedValue(baseThought)

      const result = await getThought(1, 10)

      expect(mockPrisma.thought.findUnique).toHaveBeenCalledWith({
        where: { thoughtId: 1, userId: 10 },
        include: { tags: true },
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

  describe('touchThought', () => {
    it('successful touch', async () => {
      mockPrisma.thought.update.mockResolvedValue(baseThought)

      const result = await touchThought(baseThought)

      expect(mockPrisma.thought.update).toHaveBeenCalledWith({
        where: { thoughtId: baseThought.thoughtId, userId: baseThought.userId },
        data: expect.objectContaining({ lastFollowUp: expect.any(Date) }),
      })

      expect(result).toEqual(baseThought)
    })
  })

  describe('updateThoughtTags', () => {
    it('successful update with list', async () => {
      const tags = makeTags(2)
      const mockGetTagsByIds = getTagsByIds as jest.Mock
      mockGetTagsByIds.mockResolvedValue(tags)
      mockPrisma.thought.update.mockResolvedValue(makeThought({ tags }))
      const result = (await updateThoughtTags(1, [1, 2], 10)) as Thought & { tags?: Tag[] }
      expect(mockGetTagsByIds).toHaveBeenCalledWith([1, 2], 10)
      expect(mockPrisma.thought.update).toHaveBeenCalledWith({
        where: { thoughtId: baseThought.thoughtId, userId: baseThought.userId },
        data: { tags: { set: [{ tagId: 1 }, { tagId: 2 }] } },
        include: { tags: true },
      })
      expect(result.tags).toBe(tags)
    })
  })

  describe('addThoughtTag', () => {
    it('successful addition', async () => {
      const tag = makeTag()
      const mockGetTag = getTag as jest.Mock
      mockGetTag.mockResolvedValue(tag)
      mockPrisma.thought.update.mockResolvedValue(makeThought({ tags: [tag] }))
      const thought = await addThoughtTag(1, 1, 10)
      expect(mockGetTag).toHaveBeenCalledWith(1, 10)
      expect(mockPrisma.thought.update).toHaveBeenCalledWith({
        where: { thoughtId: baseThought.thoughtId, userId: baseThought.userId },
        data: { tags: { connect: { tagId: 1 } } },
        include: { tags: true },
      })
    })
  })

  describe('remThoughtTag', () => {
    it('successful removal', async () => {
      const tag = makeTag()
      const mockGetTag = getTag as jest.Mock
      mockGetTag.mockResolvedValue(tag)
      mockPrisma.thought.update.mockResolvedValue(makeThought({ tags: [] }))
      const thought = await remThoughtTag(1, 1, 10)
      expect(mockGetTag).toHaveBeenCalledWith(1, 10)
      expect(mockPrisma.thought.update).toHaveBeenCalledWith({
        where: { thoughtId: baseThought.thoughtId, userId: baseThought.userId },
        data: { tags: { disconnect: { tagId: 1 } } },
        include: { tags: true },
      })
    })
  })
})
