/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { PrismaClient } from '@prisma/client'
import { config } from './config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  database: config.DATABASE_URL, // validated SQLite file path
})

export const prisma = new PrismaClient({ adapter })

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}
