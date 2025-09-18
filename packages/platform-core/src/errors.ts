import { fromError } from 'zod-validation-error'

import type { RateLimitResult } from './types'
import { getRateLimitHeaders } from './rate-limit-headers'

export class BaseError extends Error {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super(message, { cause })

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name

    // Disabling due to https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-error-capture-stack-trace.md
    // Set stack trace to caller
    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this, this.constructor)
    // }
  }
}

export class HttpError extends BaseError {
  readonly statusCode: number
  readonly headers?: Record<string, string>

  constructor({
    message,
    statusCode = 500,
    headers,
    cause
  }: {
    message: string
    statusCode?: number
    headers?: Record<string, string>
    cause?: unknown
  }) {
    super({ message, cause })

    this.statusCode = statusCode
    this.headers = headers
  }
}

export class RateLimitError extends HttpError {
  readonly rateLimitResult: RateLimitResult

  constructor({
    rateLimitResult,
    message = 'Rate limit exceeded; please try again later.',
    headers,
    cause
  }: {
    rateLimitResult: RateLimitResult
    message?: string
    headers?: Record<string, string>
    cause?: unknown
  }) {
    super({
      message,
      cause,
      statusCode: 429,
      headers: {
        ...getRateLimitHeaders(rateLimitResult),
        ...headers
      }
    })

    this.rateLimitResult = rateLimitResult
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
