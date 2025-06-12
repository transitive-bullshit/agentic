import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HttpError } from '@agentic/platform-core'
import { suppressedHttpStatuses } from '@agentic/platform-hono'
import * as Sentry from '@sentry/cloudflare'
import { HTTPException } from 'hono/http-exception'
import { HTTPError } from 'ky'

import type { RawEnv } from './env'
import type { McpToolCallResponse } from './types'

/**
 * Turns a thrown error into an MCP error tool call response, and attempts to
 * capture as much context as possible for potential debugging.
 *
 * @note This function is synchronous and should never throw.
 */
export function handleMcpToolCallError(
  err: any,
  {
    toolName,
    env
  }: {
    toolName: string
    env: RawEnv
  }
): McpToolCallResponse {
  const isProd = env.ENVIRONMENT === 'production'
  let message = 'Internal Server Error'
  let status: ContentfulStatusCode = 500

  const res: McpToolCallResponse = {
    _meta: {
      agentic: {
        toolName,
        headers: {}
      }
    },
    isError: true,
    content: [
      {
        type: 'text',
        text: message
      }
    ]
  }

  if (err instanceof HttpError) {
    message = err.message
    status = err.statusCode as ContentfulStatusCode

    // This is where rate-limit headers will be set, since `RateLimitError`
    // is a subclass of `HttpError`.
    if (err.headers) {
      for (const [key, value] of Object.entries(err.headers)) {
        ;(res._meta!.agentic as any).headers[key] = value
      }
    }
  } else if (err instanceof HTTPException) {
    message = err.message
    status = err.status
  } else if (err instanceof HTTPError) {
    message = err.message
    status = err.response.status as ContentfulStatusCode
  } else if (!isProd && err.message) {
    message = err.message
  }

  if (!Number.isSafeInteger(status)) {
    status = 500
  }

  if (!suppressedHttpStatuses.has(status)) {
    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error(`mcp tool call "${toolName}" error`, status, err)

      if (isProd) {
        try {
          Sentry.captureException(err)
        } catch (err_) {
          // eslint-disable-next-line no-console
          console.error('Error Sentry.captureException failed', err, err_)
        }
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn(`mcp tool call "${toolName}" warning`, status, err)
    }
  }

  ;(res._meta!.agentic as any).status = status
  res.content = [
    {
      type: 'text',
      text: message
    }
  ]

  return res
}
