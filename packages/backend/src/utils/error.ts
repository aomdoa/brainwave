/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import { ZodError } from 'zod'
export class AppError extends Error {
  status: number
  expose: boolean

  constructor(message: string, status = 500, expose = false) {
    super(message)
    this.status = status
    this.expose = expose
  }

  toJSON() {
    return {
      message: this.message,
      status: this.status,
    }
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }
}

export class ValidationError extends AppError {
  details?: Array<{ field: string; issue: string }>

  constructor(message: string, zodError?: ZodError | { field: string; issue: string; code: string }) {
    super(message, 400, true)
    if (zodError instanceof ZodError) {
      this.details = zodError.issues.map((e) => ({
        field: e.path.join('.') || '(root)',
        issue: e.message,
        code: e.code, // optional for programmatic handling
      }))
    }
  }

  toJSON() {
    return {
      message: this.message,
      status: this.status,
      details: this.details,
    }
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, true)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, true)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true)
  }
}
