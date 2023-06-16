import type { Jsonifiable } from 'type-fest'
import type { ZodError } from 'zod'
import { ValidationError, fromZodError } from 'zod-validation-error'

export type ErrorOptions = {
  /** HTTP status code for the error. */
  status?: number

  /** The original error that caused this error. */
  cause?: unknown

  /** Additional context to be added to the error. */
  context?: Jsonifiable
}

export class BaseError extends Error {
  status?: number
  context?: Jsonifiable

  constructor(message: string, opts: ErrorOptions = {}) {
    if (opts.cause) {
      super(message, { cause: opts.cause })
    } else {
      super(message)
    }

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name

    // Set stack trace to caller
    Error.captureStackTrace?.(this, this.constructor)

    // Status is used for Express error handling
    if (opts.status) {
      this.status = opts.status
    }

    // Add additional context to the error
    if (opts.context) {
      this.context = opts.context
    }
  }
}

/**
 * An error caused by an OpenAI API call.
 */
export class OpenAIApiError extends BaseError {
  constructor(message: string, opts: ErrorOptions = {}) {
    opts.status = opts.status || 500
    super(message, opts)

    Error.captureStackTrace?.(this, this.constructor)
  }
}

export class ZodOutputValidationError extends BaseError {
  validationError: ValidationError

  constructor(zodError: ZodError) {
    const validationError = fromZodError(zodError)
    super(validationError.message, { cause: zodError })

    Error.captureStackTrace?.(this, this.constructor)

    this.validationError = validationError
  }
}

export class OutputValidationError extends BaseError {
  constructor(message: string, opts: ErrorOptions = {}) {
    super(message, opts)

    Error.captureStackTrace?.(this, this.constructor)
  }
}

export class TemplateValidationError extends BaseError {
  constructor(message: string, opts: ErrorOptions = {}) {
    super(message, opts)

    Error.captureStackTrace?.(this, this.constructor)
  }
}
