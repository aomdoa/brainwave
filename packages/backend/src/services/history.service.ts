/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */

import { ThoughtBodyHistory } from '@prisma/client'
import { prisma } from '../utils/prisma'
import logger from '../utils/logger'

const serviceLog = logger.child({ file: 'history.service.ts' })

export async function createHistory(thoughtId: number, body: string): Promise<ThoughtBodyHistory | null> {
  if (body.length === 0) return null // no empty history needed

  const history = await prisma.thoughtBodyHistory.create({
    data: {
      thoughtId,
      body,
    },
  })
  serviceLog.debug(`createHistory: ${JSON.stringify(history)}`)
  return history
}

export async function getHistory(thoughtId: number): Promise<ThoughtBodyHistory[]> {
  const histories = await prisma.thoughtBodyHistory.findMany({ where: { thoughtId }, orderBy: { createdAt: 'desc' } })
  serviceLog.debug(`getHistory for ${thoughtId} with count ${histories.length}`)
  return histories
}
