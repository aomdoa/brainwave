/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import logger from '../utils/logger'
import { prisma } from '../utils/prisma'
import webpush from '../utils/webpush'

const serviceLog = logger.child({ file: 'subscribe.service.ts' })

export async function updateSubscription(userId: number, subscription: webpush.PushSubscription): Promise<boolean> {
  const { endpoint, keys } = subscription
  let changed = false
  const existing = await prisma.subscription.findUnique({
    where: { endpoint },
  })

  if (!existing) {
    serviceLog.debug(`New web subscription for ${userId}`)
    await prisma.subscription.create({
      data: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    })
    changed = true
  } else {
    serviceLog.debug(`Existing web subscription for ${userId}`)
    if (existing.userId !== userId) {
      await prisma.subscription.update({
        where: { endpoint },
        data: { userId },
      })
      changed = true
    }

    if (existing.p256dh !== keys.p256dh || existing.auth !== keys.auth) {
      serviceLog.debug(`Web subscription keys changed for ${userId}`)
      await prisma.subscription.update({
        where: { endpoint },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      })
      changed = true
    }
  }
  if (!changed) {
    serviceLog.debug(`Web subscription did not change for ${userId}`)
  }
  return changed
}

export async function sendNotifications(): Promise<void> {
  serviceLog.debug('sendNotifications')

  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date()
  end.setUTCHours(23, 59, 59, 999)

  const thoughts = await prisma.thought.findMany({
    where: {
      nextReminder: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: true,
    },
  })
  serviceLog.debug(`There are ${thoughts.length} potential thoughts for notification`)

  const users = new Map(thoughts.map((t) => [t.userId, t.user]))
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: { in: [...users.keys()] },
    },
  })
  serviceLog.debug(`There are ${subscriptions.length} subscriptions for the thoughts`)

  for (const sub of subscriptions) {
    const userThoughts = thoughts.filter((t) => t.userId === sub.userId)
    let notification = {
      title: 'Brainwave Notification',
      body: '',
      data: {
        url: '',
      },
    }
    if (userThoughts.length === 1) {
      notification.body = userThoughts[0].title
      notification.data.url = `/thoughts/${userThoughts[0].thoughtId}`
    } else {
      notification.body = 'You have some thoughts to follow up on'
      notification.data.url = '/thoughts'
    }
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(notification)
      )
      serviceLog.debug(`Sent user ${sub.userId} a notification`)
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        serviceLog.debug(`Removing user ${sub.userId} from notifications: ${err.message}`)
        await prisma.subscription.delete({
          where: { endpoint: sub.endpoint },
        })
      } else {
        serviceLog.warn(`Unable to notify user ${sub.userId} with error: ${err.message}`)
      }
    }
  }
}
