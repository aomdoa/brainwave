/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { start as startService } from './service'

async function main(): Promise<void> {
  startService()
}

main().catch((err) => {
  console.error('Error starting Brainwave:', err)
  process.exit(1)
})
