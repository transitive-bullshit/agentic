import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { fromError } from 'zod-validation-error'

export class BaseError extends Error {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super(message, { cause })

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name

    // Set stack trace to caller
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class HttpError extends BaseError {
  readonly statusCode: ContentfulStatusCode

  constructor({
    statusCode = 500,
    message,
    cause
  }: {
    statusCode?: ContentfulStatusCode
    message: string
    cause?: unknown
  }) {
    super({ message, cause })

    this.statusCode = statusCode
  }
}

export class ZodValidationError extends BaseError {
  constructor({ prefix, cause }: { prefix?: string; cause: unknown }) {
    const error = fromError(cause, { prefix })
    super({ message: error.message, cause })
  }
}
