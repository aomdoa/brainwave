/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { defineConfig } from 'prisma/config'
import process from 'process'

/**
 * Provides the required configuration for prisma updates
 */
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
