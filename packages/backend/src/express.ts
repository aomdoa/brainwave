/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express, { Express, ErrorRequestHandler } from 'express'
import cors from 'cors'
import { config } from './utils/config'
import logger from './utils/logger'
import { AppError } from './utils/error'
import { registerAuthRoutes } from './routes/auth.route'
import { registerHealthRoutes } from './routes/health.route'
import { registerThoughtRoute } from './routes/thought.route'
import { setupSwagger } from './utils/swagger'

const serviceLog = logger.child({ file: 'express.ts' })

// Provides the core initialization and startup of the Express server, including error handling and request logging
export function initialize(): Express {
  const app = express()

  // eslint-disable-next-line no-unused-vars
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = err.status ?? 500
    const expose = (err as AppError).expose ?? false
    if (expose) {
      const details = typeof (err as any).toJSON === 'function' ? (err as any).toJSON() : { message: err.message }
      res.status(status).json(details)
    } else {
      res.status(status).json({ message: 'Internal Server Error' })
    }
    if (!expose) serviceLog.error(err)
  }

  app.use(express.json())
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }))

  // If we're in debug mode track each request and log the details and duration when it finishes
  if (config.LOG_LEVEL === 'debug') {
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
  }

  // Register routes
  app.use('/auth', registerAuthRoutes())
  app.use('/thoughts', registerThoughtRoute())
  app.use('/health', registerHealthRoutes())

  // Swagger
  setupSwagger(app)
  // Capture the errors
  app.use(errorHandler)

  return app
}

// Start the show
export function start(app: Express): void {
  app.listen(config.PORT, () => {
    serviceLog.info({ port: config.PORT, logLevel: config.LOG_LEVEL }, 'Server started...')
  })
}

export default {
  initialize,
  start,
}
