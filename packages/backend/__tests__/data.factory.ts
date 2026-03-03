/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { Status } from '@prisma/client'

export const date = new Date('2026-01-01T00:00:00.000Z')

// thoughts
export const baseThought = {
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
export const makeThought = (overrides = {}) => ({
  ...baseThought,
  ...overrides,
})
export const makeThougts = (count: number) =>
  Array.from({ length: count }, (_, i) => makeThought({ tagId: i + 1, name: `thought-${i + 1}` }))

// tags
export const baseTag = {
  tagId: 1,
  name: 'Tag Name',
  notes: 'Notes',
  userId: 5,
  createdAt: date,
  updatedAt: date,
}
export const makeTag = (overrides = {}) => ({
  ...baseTag,
  ...overrides,
})
export const makeTags = (count: number) =>
  Array.from({ length: count }, (_, i) => makeTag({ tagId: i + 1, name: `tag-${i + 1}` }))
