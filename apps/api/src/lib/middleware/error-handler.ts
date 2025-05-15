import type { ContentfulStatusCode } from 'hono/utils/http-status'
import * as Sentry from '@sentry/node'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import type { DefaultEnv } from '@/lib/types'
import { HttpError } from '@/lib/errors'

import { env } from '../env'

export const errorHandler = createMiddleware<DefaultEnv>(
  async function errorHandlerMiddleware(ctx, next) {
    try {
      await next()

      if (!ctx.res.status) {
        throw new HttpError({ statusCode: 404, message: 'Not Found' })
      }
    } catch (err: any) {
      let message = 'Internal Server Error'
      let status: ContentfulStatusCode = 500

      if (err instanceof HTTPException) {
        message = err.message
        status = err.status
      } else if (err instanceof HttpError) {
        message = err.message
        status = err.statusCode
      } else if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
        message = err.message ?? message
      }

      const logger = ctx.get('logger')
      if (status >= 500) {
        logger.error(message, { err, status })
        Sentry.captureException(err)
      } else {
        logger.warn(message, { err, status })
      }

      ctx.json({ error: message }, status)
    }
  }
)
