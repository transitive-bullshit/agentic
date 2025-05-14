import { createHash, randomUUID } from 'node:crypto'

import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ZodSchema } from 'zod'
import { z } from '@hono/zod-openapi'

import { HttpError, ZodValidationError } from './errors'

export function sha256(input: string = randomUUID()) {
  return createHash('sha256').update(input).digest('hex')
}

export function assert(expr: unknown, message?: string): asserts expr
export function assert(
  expr: unknown,
  statusCode?: ContentfulStatusCode,
  message?: string
): asserts expr
export function assert(
  expr: unknown,
  statusCodeOrMessage?: ContentfulStatusCode | string,
  message = 'Internal assertion failed'
): asserts expr {
  if (expr) {
    return
  }

  if (typeof statusCodeOrMessage === 'number') {
    throw new HttpError({ statusCode: statusCodeOrMessage, message })
  } else {
    throw new Error(statusCodeOrMessage ?? message)
  }
}

export function parseZodSchema<T>(
  schema: ZodSchema<T>,
  input: unknown,
  {
    error
  }: {
    error?: string
  } = {}
): T {
  try {
    return schema.parse(input)
  } catch (err) {
    throw new ZodValidationError({
      prefix: error,
      cause: err
    })
  }
}

const errorContent = {
  'application/json': {
    schema: z.object({
      error: z.string()
    })
  }
} as const

export const openapiErrorResponses = {
  400: {
    description: 'Bad Request',
    content: errorContent
  },
  401: {
    description: 'Unauthorized',
    content: errorContent
  },
  403: {
    description: 'Forbidden',
    content: errorContent
  }
} as const

export const openapiErrorResponse404 = {
  404: {
    description: 'Not Found',
    content: errorContent
  }
} as const

export const openapiErrorResponse409 = {
  409: {
    description: 'Conflict',
    content: errorContent
  }
} as const

export const openapiErrorResponse410 = {
  410: {
    description: 'Gone',
    content: errorContent
  }
} as const
