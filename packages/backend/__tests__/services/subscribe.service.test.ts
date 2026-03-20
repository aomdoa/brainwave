/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 * @contributor https://claude.ai
 */
import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import { updateSubscription, getToday, sendNotifications } from '../../src/services/subscribe.service'
import { prisma } from '../../src/utils/prisma'
import webpush from '../../src/utils/webpush'

// ── Prisma mock ──────────────────────────────────────────────────────────────
jest.mock('../../src/utils/prisma', () => ({
  ...jest.requireActual('../../src/utils/prisma'),
  prisma: mockDeep<PrismaClient>(),
}))

// ── webpush mock ─────────────────────────────────────────────────────────────
jest.mock('../../src/utils/webpush', () => ({
  sendNotification: jest.fn(),
}))

// ── logger mock (silence output during tests) ────────────────────────────────
jest.mock('../../src/utils/logger', () => ({
  child: () => ({ debug: jest.fn(), warn: jest.fn() }),
}))

// Typed alias so TypeScript knows every method is a jest mock
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
const webpushMock = webpush as jest.Mocked<typeof webpush>

// ────────────────────────────────────────────────────────────────────────────
// Helpers / fixtures
// ────────────────────────────────────────────────────────────────────────────
const makeSubscription = (overrides: Partial<webpush.PushSubscription> = {}): webpush.PushSubscription => ({
  endpoint: 'https://push.example.com/sub/abc123',
  keys: { p256dh: 'key-p256dh', auth: 'key-auth' },
  ...overrides,
})

const makeDbSubscription = (overrides = {}) => ({
  subscriptionId: 1,
  userId: 42,
  endpoint: 'https://push.example.com/sub/abc123',
  p256dh: 'key-p256dh',
  auth: 'key-auth',
  ...overrides,
})

const makeThought = (overrides = {}) => ({
  thoughtId: 1,
  userId: 42,
  title: 'Test thought',
  nextReminder: new Date(),
  user: { userId: 42, email: 'user@example.com' },
  ...overrides,
})

// ────────────────────────────────────────────────────────────────────────────
// updateSubscription
// ────────────────────────────────────────────────────────────────────────────
describe('updateSubscription', () => {
  const userId = 42
  const subscription = makeSubscription()

  beforeEach(() => jest.clearAllMocks())

  describe('when no existing subscription is found', () => {
    it('creates a new subscription and returns true', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null)
      prismaMock.subscription.create.mockResolvedValue(makeDbSubscription())

      const result = await updateSubscription(userId, subscription)

      expect(prismaMock.subscription.findUnique).toHaveBeenCalledWith({
        where: { endpoint: subscription.endpoint },
      })
      expect(prismaMock.subscription.create).toHaveBeenCalledWith({
        data: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      })
      expect(result).toBe(true)
    })
  })

  describe('when an existing subscription is found', () => {
    it('returns false when nothing has changed', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeDbSubscription())

      const result = await updateSubscription(userId, subscription)

      expect(prismaMock.subscription.update).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('updates userId when it differs and returns true', async () => {
      const differentUserId = 99
      prismaMock.subscription.findUnique.mockResolvedValue(makeDbSubscription({ userId: differentUserId }))
      prismaMock.subscription.update.mockResolvedValue(makeDbSubscription({ userId }))

      const result = await updateSubscription(userId, subscription)

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(expect.objectContaining({ data: { userId } }))
      expect(result).toBe(true)
    })

    it('updates keys when p256dh has changed and returns true', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeDbSubscription({ p256dh: 'old-p256dh' }))
      prismaMock.subscription.update.mockResolvedValue(makeDbSubscription())

      const result = await updateSubscription(userId, subscription)

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
        })
      )
      expect(result).toBe(true)
    })

    it('updates keys when auth has changed and returns true', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeDbSubscription({ auth: 'old-auth' }))
      prismaMock.subscription.update.mockResolvedValue(makeDbSubscription())

      const result = await updateSubscription(userId, subscription)

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
        })
      )
      expect(result).toBe(true)
    })

    it('performs both userId and keys updates when both differ and returns true', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeDbSubscription({ userId: 99, p256dh: 'old-p256dh', auth: 'old-auth' })
      )
      prismaMock.subscription.update.mockResolvedValue(makeDbSubscription())

      const result = await updateSubscription(userId, subscription)

      // Two separate update calls: one for userId, one for keys
      expect(prismaMock.subscription.update).toHaveBeenCalledTimes(2)
      expect(result).toBe(true)
    })
  })
})

// ────────────────────────────────────────────────────────────────────────────
// getToday
// ────────────────────────────────────────────────────────────────────────────
describe('getToday', () => {
  it('returns start with UTC time 00:00:00.000', () => {
    const { start } = getToday()
    expect(start.getUTCHours()).toBe(0)
    expect(start.getUTCMinutes()).toBe(0)
    expect(start.getUTCSeconds()).toBe(0)
    expect(start.getUTCMilliseconds()).toBe(0)
  })

  it('returns end with UTC time 23:59:59.999', () => {
    const { end } = getToday()
    expect(end.getUTCHours()).toBe(23)
    expect(end.getUTCMinutes()).toBe(59)
    expect(end.getUTCSeconds()).toBe(59)
    expect(end.getUTCMilliseconds()).toBe(999)
  })

  it('start and end share the same UTC date', () => {
    const { start, end } = getToday()
    expect(start.getUTCFullYear()).toBe(end.getUTCFullYear())
    expect(start.getUTCMonth()).toBe(end.getUTCMonth())
    expect(start.getUTCDate()).toBe(end.getUTCDate())
  })

  it('start is before end', () => {
    const { start, end } = getToday()
    expect(start.getTime()).toBeLessThan(end.getTime())
  })
})

// ────────────────────────────────────────────────────────────────────────────
// sendNotifications
// ────────────────────────────────────────────────────────────────────────────
describe('sendNotifications', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does nothing when there are no thoughts for today', async () => {
    prismaMock.thought.findMany.mockResolvedValue([])
    prismaMock.subscription.findMany.mockResolvedValue([])

    await sendNotifications()

    expect(webpushMock.sendNotification).not.toHaveBeenCalled()
    expect(prismaMock.subscription.delete).not.toHaveBeenCalled()
  })

  it('does nothing when there are thoughts but no matching subscriptions', async () => {
    prismaMock.thought.findMany.mockResolvedValue([makeThought() as any])
    prismaMock.subscription.findMany.mockResolvedValue([])

    await sendNotifications()

    expect(webpushMock.sendNotification).not.toHaveBeenCalled()
  })

  it("queries thoughts within today's UTC range", async () => {
    prismaMock.thought.findMany.mockResolvedValue([])
    prismaMock.subscription.findMany.mockResolvedValue([])

    await sendNotifications()

    const call = prismaMock.thought.findMany.mock.calls[0][0]
    const { gte, lte } = (call as any).where.nextReminder

    expect(gte.getUTCHours()).toBe(0)
    expect(lte.getUTCHours()).toBe(23)
    expect(gte.getTime()).toBeLessThan(lte.getTime())
  })

  it('sends a single-thought notification with the thought title and direct URL', async () => {
    const thought = makeThought()
    prismaMock.thought.findMany.mockResolvedValue([thought as any])
    prismaMock.subscription.findMany.mockResolvedValue([makeDbSubscription() as any])
    webpushMock.sendNotification.mockResolvedValue({} as any)

    await sendNotifications()

    expect(webpushMock.sendNotification).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(webpushMock.sendNotification.mock.calls[0][1] as string)
    expect(payload.body).toBe(thought.title)
    expect(payload.data.url).toBe(`/thoughts/${thought.thoughtId}`)
  })

  it('sends a multi-thought notification with generic body and /thoughts URL', async () => {
    const thoughts = [makeThought({ thoughtId: 1, title: 'First' }), makeThought({ thoughtId: 2, title: 'Second' })]
    prismaMock.thought.findMany.mockResolvedValue(thoughts as any)
    prismaMock.subscription.findMany.mockResolvedValue([makeDbSubscription() as any])
    webpushMock.sendNotification.mockResolvedValue({} as any)

    await sendNotifications()

    const payload = JSON.parse(webpushMock.sendNotification.mock.calls[0][1] as string)
    expect(payload.body).toBe('You have some thoughts to follow up on')
    expect(payload.data.url).toBe('/thoughts')
  })

  it('sends notifications to multiple subscribers for the same user', async () => {
    const thought = makeThought()
    const sub1 = makeDbSubscription({ subscriptionId: 1, endpoint: 'https://push.example.com/1' })
    const sub2 = makeDbSubscription({ subscriptionId: 2, endpoint: 'https://push.example.com/2' })

    prismaMock.thought.findMany.mockResolvedValue([thought as any])
    prismaMock.subscription.findMany.mockResolvedValue([sub1, sub2] as any)
    webpushMock.sendNotification.mockResolvedValue({} as any)

    await sendNotifications()

    expect(webpushMock.sendNotification).toHaveBeenCalledTimes(2)
  })

  it('passes the correct push subscription object to webpush', async () => {
    const thought = makeThought()
    const sub = makeDbSubscription()

    prismaMock.thought.findMany.mockResolvedValue([thought as any])
    prismaMock.subscription.findMany.mockResolvedValue([sub as any])
    webpushMock.sendNotification.mockResolvedValue({} as any)

    await sendNotifications()

    expect(webpushMock.sendNotification).toHaveBeenCalledWith(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      expect.any(String)
    )
  })

  it('deletes a subscription when webpush returns a 404 status', async () => {
    const thought = makeThought()
    const sub = makeDbSubscription()

    prismaMock.thought.findMany.mockResolvedValue([thought as any])
    prismaMock.subscription.findMany.mockResolvedValue([sub as any])
    prismaMock.subscription.delete.mockResolvedValue(sub as any)
    webpushMock.sendNotification.mockRejectedValue({ statusCode: 404, message: 'Not Found' })

    await sendNotifications()

    expect(prismaMock.subscription.delete).toHaveBeenCalledWith({
      where: { endpoint: sub.endpoint },
    })
  })

  it('deletes a subscription when webpush returns a 410 status', async () => {
    const thought = makeThought()
    const sub = makeDbSubscription()

    prismaMock.thought.findMany.mockResolvedValue([thought as any])
    prismaMock.subscription.findMany.mockResolvedValue([sub as any])
    prismaMock.subscription.delete.mockResolvedValue(sub as any)
    webpushMock.sendNotification.mockRejectedValue({ statusCode: 410, message: 'Gone' })

    await sendNotifications()

    expect(prismaMock.subscription.delete).toHaveBeenCalledWith({
      where: { endpoint: sub.endpoint },
    })
  })

  it('does not delete subscription for other webpush errors', async () => {
    const thought = makeThought()
    const sub = makeDbSubscription()

    prismaMock.thought.findMany.mockResolvedValue([thought as any])
    prismaMock.subscription.findMany.mockResolvedValue([sub as any])
    webpushMock.sendNotification.mockRejectedValue({ statusCode: 500, message: 'Server Error' })

    await sendNotifications()

    expect(prismaMock.subscription.delete).not.toHaveBeenCalled()
  })

  it('continues processing remaining subscriptions after one fails', async () => {
    const thought = makeThought()
    const failingSub = makeDbSubscription({ subscriptionId: 1, endpoint: 'https://push.example.com/1' })
    const successSub = makeDbSubscription({ subscriptionId: 2, endpoint: 'https://push.example.com/2' })

    prismaMock.thought.findMany.mockResolvedValue([thought as any])
    prismaMock.subscription.findMany.mockResolvedValue([failingSub, successSub] as any)
    webpushMock.sendNotification
      .mockRejectedValueOnce({ statusCode: 500, message: 'Server Error' })
      .mockResolvedValueOnce({} as any)

    await sendNotifications()

    expect(webpushMock.sendNotification).toHaveBeenCalledTimes(2)
  })

  it('only queries subscriptions for users who have thoughts today', async () => {
    const thought = makeThought({ userId: 42 })
    prismaMock.thought.findMany.mockResolvedValue([thought as any])
    prismaMock.subscription.findMany.mockResolvedValue([])

    await sendNotifications()

    const subscriptionQuery = prismaMock.subscription.findMany.mock.calls[0][0]
    expect((subscriptionQuery as any).where.userId.in).toContain(42)
  })
})
