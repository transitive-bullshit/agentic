import type { AdminDeployment } from '@agentic/platform-types'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HttpError, pruneEmpty } from '@agentic/platform-core'
import * as Sentry from '@sentry/cloudflare'
import { HTTPException } from 'hono/http-exception'
import { HTTPError } from 'ky'

import type { RawEnv } from './env'
import type { AdminConsumer, McpToolCallResponse } from './types'

export function handleMcpToolCallError(
  err: any,
  {
    deployment,
    consumer,
    toolName,
    sessionId,
    requestId,
    env
  }: {
    deployment: AdminDeployment
    consumer?: AdminConsumer
    toolName: string
    sessionId: string
    requestId?: string
    env: RawEnv
  }
): McpToolCallResponse {
  let message = 'Internal Server Error'
  let status: ContentfulStatusCode = 500

  const res: McpToolCallResponse = {
    _meta: pruneEmpty({
      deploymentId: deployment.id,
      consumerId: consumer?.id,
      toolName,
      sessionId,
      requestId
    }),
    isError: true,
    content: [
      {
        type: 'text',
        text: message
      }
    ]
  }

  const isProd = env.ENVIRONMENT === 'production'

  if (err instanceof HttpError) {
    message = err.message
    status = err.statusCode as ContentfulStatusCode

    // This is where rate-limit headers will be set, since `RateLimitError`
    // is a subclass of `HttpError`.
    if (err.headers) {
      for (const [key, value] of Object.entries(err.headers)) {
        res._meta![key] = value
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

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error(`mcp tool call "${toolName}" error`, status, err)

    if (isProd) {
      Sentry.captureException(err)
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(`mcp tool call "${toolName}" warning`, status, message, err)
  }

  res._meta!.status = status
  res.content = [
    {
      type: 'text',
      text: message
    }
  ]

  return res
}
