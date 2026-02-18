/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import express, { Express, ErrorRequestHandler, Response, NextFunction } from 'express'
import cors from 'cors'
import { config } from './utils/config'
import logger from './utils/logger'
import { AppError, ForbbiddenError, ValidationError } from './utils/error'
import { registerAuthRoutes } from './routes/auth.route'
import { registerHealthRoutes } from './routes/health.route'
import jwt from 'jsonwebtoken'

const serviceLog = logger.child({ file: 'express.ts' })
export interface AuthRequest extends express.Request {
  userId?: number
}

// Provides the core initialization and startup of the Express server, including error handling and request logging
export function initialize(): Express {
  const app = express()

  // eslint-disable-next-line no-unused-vars
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = err.status ?? 500
    const expose = (err as AppError).expose ?? false

    res.status(status).json({ message: expose ? err.message : 'Internal Server Error' })
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
  registerAuthRoutes(app)
  registerHealthRoutes(app)

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

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header) {
    throw new ValidationError('Missing token')
  }

  const token = header.split(' ')[1]
  if (!token) {
    throw new ValidationError('Missing token')
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as { userId: number }
    req.userId = payload.userId
    return next()
  } catch {
    throw new ForbbiddenError('Invalid token')
  }
}

export default {
  initialize,
  start,
  authMiddleware,
}
