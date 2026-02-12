/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express from 'express'
import { config } from './utils/config'
import logger from './utils/logger'

const serviceLog = logger.child({ file: 'index.ts' })
const app = express()

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    serviceLog.debug(
      {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - start,
      },
      'Completed REST request'
    )
  })
  next()
})

app.get('/', (_req, res) => {
  res.json({ message: 'Brainwave is alive!' })
})

app.listen(config.PORT, () => {
  serviceLog.info({ port: config.PORT, logLevel: config.LOG_LEVEL }, 'Server started...')
})
