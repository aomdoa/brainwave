/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express, { Express, ErrorRequestHandler } from 'express'
import cors from 'cors'
import { config } from './utils/config'
import logger from './utils/logger'
import { AppError } from './utils/error'
import { registerUserRoutes } from './routes/user.route'
import { registerHealthRoutes } from './routes/health.route'
import { registerThoughtRoutes } from './routes/thought.route'
import { registerTagRoutes } from './routes/tag.route'
import { registerThoughtTagRoutes } from './routes/thoughtTag.route'
import { setupSwagger } from './utils/swagger'
import { registerThoughtRelationRoutes } from './routes/thoughtRelation.route'
import { registerThoughtHistoryRoutes } from './routes/thoughtHistory.route'
import passport from './utils/passport'
import { registerSubscribeRoutes } from './routes/subscribe.route'

const serviceLog = logger.child({ file: 'express.ts' })

// Provides the core initialization and startup of the Express server, including error handling and request logging
export function initialize(): Express {
  const app = express()
  app.set('trust proxy', true)

  app.use(express.json())
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }))
  app.use(passport.initialize())

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
  const userRoutes = registerUserRoutes()
  app.use('/user', userRoutes)
  app.use('/auth', userRoutes) // google is stuck with auth for some reason?
  app.use('/thoughts', registerThoughtRoutes())
  app.use('/thoughts', registerThoughtTagRoutes())
  app.use('/thoughts', registerThoughtRelationRoutes())
  app.use('/thoughts', registerThoughtHistoryRoutes())
  app.use('/tags', registerTagRoutes())
  app.use('/push', registerSubscribeRoutes())
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
