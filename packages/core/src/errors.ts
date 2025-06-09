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
  readonly statusCode: number

  constructor({
    message,
    statusCode = 500,
    cause
  }: {
    message: string
    statusCode?: number
    cause?: unknown
  }) {
    super({ message, cause })

    this.statusCode = statusCode
  }
}

export class JsonRpcError extends HttpError {
  readonly jsonRpcErrorCode: number
  readonly jsonRpcId: string | number | null

  constructor({
    message,
    jsonRpcErrorCode,
    jsonRpcId = null,
    statusCode,
    cause
  }: {
    message: string
    jsonRpcErrorCode: number
    jsonRpcId?: string | number | null
    statusCode?: number
    cause?: unknown
  }) {
    super({ message, cause, statusCode })

    this.jsonRpcErrorCode = jsonRpcErrorCode
    this.jsonRpcId = jsonRpcId
  }
}

export class ZodValidationError extends HttpError {
  constructor({
    statusCode,
    prefix,
    cause
  }: {
    statusCode?: number
    prefix?: string
    cause: unknown
  }) {
    const error = fromError(cause, { prefix })
    super({ message: error.message, cause, statusCode })
  }
}
