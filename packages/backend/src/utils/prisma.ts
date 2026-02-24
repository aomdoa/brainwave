/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { PrismaClient } from '@prisma/client'
import { config } from './config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import logger from './logger'
import { FilterCondition } from '@brainwave/shared'

const serviceLog = logger.child({ file: 'utils/prisma.ts' })

export type PrismaWhere = any

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

export const prismaOperatorMap: Record<string, string> = {
  eq: 'equals',
  ne: 'not',
  gt: 'gt',
  ge: 'gte',
  lt: 'lt',
  le: 'lte',
}

export function buildPrismaWhere(
  filters: FilterCondition[],
  columns: string[] = [],
  search: string | undefined = undefined
): PrismaWhere {
  if (!filters?.length) return {}

  let andStack: any[] = []
  let orStack: any[] = []

  for (const cond of filters) {
    const prismaOp = prismaOperatorMap[cond.operator]
    if (!prismaOp) continue

    let value: string | number | Date = cond.value
    if (!isNaN(Number(cond.value))) value = Number(cond.value)
    if (/\d{4}-\d{2}-\d{2}/.test(cond.value)) value = new Date(cond.value)

    const filterObj = { [cond.field]: { [prismaOp]: value } }
    if (cond.logical === 'or') {
      orStack.push(filterObj)
    } else {
      andStack.push(filterObj)
    }
  }

  if (columns.length > 0 && search) {
    const cols = []
    for (let i = 0; i < columns.length; i++) {
      cols.push({ [columns[i]]: { contains: search } }) //, mode: 'insensitive' } })
    }
    andStack.push({ OR: cols })
  }

  const where: any = {}
  if (andStack.length) where.AND = andStack
  if (orStack.length) where.OR = orStack

  serviceLog.debug(`buildPrismaWhere from ${JSON.stringify(filters)} to ${JSON.stringify(where)}`)
  return where
}
