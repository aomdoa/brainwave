/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { PrismaClient } from '@prisma/client'
import { config } from './config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: config.DATABASE_URL, // validated SQLite file path
})

export const prisma = new PrismaClient({ adapter })
prisma.$connect().catch((err) => {
  console.error('Failed to connect to the database:', err)
  process.exit(1)
})

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}
