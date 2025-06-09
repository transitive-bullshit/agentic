import type { Context } from 'hono'
import type { HTTPResponseError } from 'hono/types'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HttpError, JsonRpcError } from '@agentic/platform-core'
import { captureException } from '@sentry/core'
import { HTTPException } from 'hono/http-exception'
import { HTTPError } from 'ky'

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

  if (err instanceof HTTPException) {
    message = err.message
    status = err.status
  } else if (err instanceof HttpError) {
    message = err.message
    status = err.statusCode as ContentfulStatusCode
  } else if (err instanceof HTTPError) {
    message = err.message
    status = err.response.status as ContentfulStatusCode
  } else if (err instanceof JsonRpcError) {
    message = err.message
    status = err.statusCode as ContentfulStatusCode
    jsonRpcId = err.jsonRpcId
    jsonRpcErrorCode = err.jsonRpcErrorCode
    isJsonRpcRequest = true
  } else if (!isProd) {
    message = err.message ?? message
  }

  if (status >= 500) {
    logger.error(status, err)
    captureException(err)
  } else {
    logger.warn(status, err)
  }

  if (isJsonRpcRequest) {
    if (jsonRpcErrorCode === undefined) {
      jsonRpcErrorCode = httpStatusCodeToJsonRpcErrorCode(status)
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

/** Error codes defined by the JSON-RPC specification. */
export declare enum JsonRpcErrorCodes {
  ConnectionClosed = -32_000,
  RequestTimeout = -32_001,
  ParseError = -32_700,
  InvalidRequest = -32_600,
  MethodNotFound = -32_601,
  InvalidParams = -32_602,
  InternalError = -32_603
}

export function httpStatusCodeToJsonRpcErrorCode(
  statusCode: ContentfulStatusCode
): number {
  if (statusCode >= 400 && statusCode < 500) {
    return JsonRpcErrorCodes.InvalidRequest
  }

  return JsonRpcErrorCodes.InternalError
}
