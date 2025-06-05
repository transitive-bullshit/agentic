import type { Context } from 'hono'
import type { HTTPResponseError } from 'hono/types'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HttpError } from '@agentic/platform-core'
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

  let message = 'Internal Server Error'
  let status: ContentfulStatusCode = 500

  if (err instanceof HTTPException) {
    message = err.message
    status = err.status
  } else if (err instanceof HttpError) {
    message = err.message
    status = err.statusCode
  } else if (err instanceof HTTPError) {
    message = err.message
    status = err.response.status as ContentfulStatusCode
  } else if (!isProd) {
    message = err.message ?? message
  }

  if (status >= 500) {
    logger.error(status, err)
    captureException(err)
  } else if (isProd) {
    logger.warn(status, err)
  }

  return ctx.json({ error: message, requestId }, status)
}
