/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express from './express'

async function main(): Promise<void> {
  const app = express.initialize()
  express.start(app)
}

main().catch((err) => {
  console.error('Error starting Brainwave:', err)
  process.exit(1)
})
