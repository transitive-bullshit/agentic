import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import type { AuthenticatedEnv } from '@/lib/types'

import { HttpError } from '../errors'

export const errorHandler = createMiddleware<AuthenticatedEnv>(
  async function errorHandlerMiddleware(ctx, next) {
    try {
      await next()

      if (!ctx.res.status) {
        throw new HttpError({ statusCode: 404, message: 'Not Found' })
      }
    } catch (err) {
      let message = 'Internal Server Error'
      let status: ContentfulStatusCode = 500

      if (err instanceof HTTPException) {
        message = err.message
        status = err.status
      } else if (err instanceof HttpError) {
        message = err.message
        status = err.statusCode
      }

      if (status >= 500) {
        console.error('http error', status, message)
      }

      ctx.json({ error: message }, status)
    }
  }
)
