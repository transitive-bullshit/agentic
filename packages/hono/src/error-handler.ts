import type { Context } from 'hono'
import type { HTTPResponseError } from 'hono/types'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HttpError } from '@agentic/platform-core'
import { captureException } from '@sentry/core'
import { HTTPException } from 'hono/http-exception'

export function errorHandler(
  err: Error | HTTPResponseError,
  ctx: Context
): Response {
  const isProd = ctx.env?.isProd ?? true
  const logger = ctx.get('logger') ?? console

  let message = 'Internal Server Error'
  let status: ContentfulStatusCode = 500

  if (err instanceof HTTPException) {
    message = err.message
    status = err.status
  } else if (err instanceof HttpError) {
    message = err.message
    status = err.statusCode
  } else if (!isProd) {
    message = err.message ?? message
  }

  // console.warn('ERROR', err, {
  //   isHttpException: err instanceof HTTPException,
  //   isHttpError: err instanceof HttpError,
  //   isProd
  // })

  if (status >= 500) {
    logger.error(status, err)
    captureException(err)
  } else {
    logger.warn(status, err)
  }

  return ctx.json({ error: message }, status)
}
