import type { Context } from 'hono'
import type { HTTPResponseError } from 'hono/types'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HttpError, JsonRpcError } from '@agentic/platform-core'
import { captureException } from '@sentry/core'
import { HTTPException } from 'hono/http-exception'
import { HTTPError } from 'ky'

import { applyHeaders } from './header-utils'
import {
  httpStatusCodeToJsonRpcErrorCode,
  JsonRpcErrorCodes
} from './json-rpc-errors'

// Don't log 429 errors because they may happen frequently and are just noise.
// Our access-logger should still log the 429 result, just not the whole error.
export const suppressedHttpStatuses = new Set([429])

/**
 * Hono error handler that sanitizes all types of internal, http, json-rpc, and
 * unexpected errors and responds with an appropate HTTP Response.
 *
 * @note This function is synchronous and should never throw.
 */
export function errorHandler(
  err: Error | HTTPResponseError,
  ctx: Context
): Response {
  const isProd = ctx.env?.isProd ?? true
  const logger = ctx.get('logger') ?? console
  const requestId = ctx.get('requestId')
  let isJsonRpcRequest = !!ctx.get('isJsonRpcRequest')
  let jsonRpcId: string | number | null = null
  let jsonRpcErrorCode: number | undefined

  let message = 'Internal Server Error'
  let status: ContentfulStatusCode = 500

  if (err instanceof HttpError) {
    message = err.message
    status = err.statusCode as ContentfulStatusCode

    // This is where rate-limit headers will be set, since `RateLimitError`
    // is a subclass of `HttpError`.
    applyHeaders({ res: ctx.res, headers: err.headers })
  } else if (err instanceof HTTPException) {
    message = err.message
    status = err.status
  } else if (err instanceof HTTPError) {
    message = err.message
    status = err.response.status as ContentfulStatusCode
  } else if (err instanceof JsonRpcError) {
    message = err.message
    status = err.statusCode as ContentfulStatusCode
    jsonRpcId = err.jsonRpcId
    jsonRpcErrorCode = err.jsonRpcErrorCode
    isJsonRpcRequest = true
  } else if (!isProd && err.message) {
    message = err.message
  }

  if (!Number.isSafeInteger(status)) {
    status = 500
  }

  if (!suppressedHttpStatuses.has(status)) {
    if (status >= 500) {
      logger.error(status, err)

      if (isProd) {
        try {
          captureException(err)
        } catch (err_) {
          // eslint-disable-next-line no-console
          console.error('Error Sentry.captureException failed', err, err_)
        }
      }
    } else {
      logger.warn(status, err)
    }
  }

  if (isJsonRpcRequest) {
    if (jsonRpcErrorCode === undefined) {
      jsonRpcErrorCode = httpStatusCodeToJsonRpcErrorCode(status)
    }

    if (!Number.isSafeInteger(jsonRpcErrorCode)) {
      jsonRpcErrorCode = JsonRpcErrorCodes.InternalError
    }

    return ctx.json(
      {
        jsonrpc: '2.0',
        error: {
          message,
          code: jsonRpcErrorCode
        },
        id: jsonRpcId
      },
      status
    )
  } else {
    return ctx.json({ error: message, requestId }, status)
  }
}
