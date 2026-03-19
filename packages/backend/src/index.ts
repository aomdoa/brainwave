/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import cron from 'node-cron'
import express from './express'
import { config } from './utils/config'
import { sendNotifications } from './services/subscribe.service'

async function main(): Promise<void> {
  const app = express.initialize()
  cron.schedule(config.NOTIFICATION_CRON, async () => {
    await sendNotifications()
  })
  express.start(app)
}

main().catch((err) => {
  console.error('Error starting Brainwave:', err)
  process.exit(1)
})
