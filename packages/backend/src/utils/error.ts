/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
export class AppError extends Error {
  status: number
  expose: boolean

  constructor(message: string, status = 500, expose = false) {
    super(message)
    this.status = status
    this.expose = expose
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true)
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
