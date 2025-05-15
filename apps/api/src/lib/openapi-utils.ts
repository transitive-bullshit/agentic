import { z } from '@hono/zod-openapi'

const openapiErrorContent = {
  'application/json': {
    schema: z.object({
      error: z.string()
    })
  }
} as const

export const openapiErrorResponses = {
  400: {
    description: 'Bad Request',
    content: openapiErrorContent
  },
  401: {
    description: 'Unauthorized',
    content: openapiErrorContent
  },
  403: {
    description: 'Forbidden',
    content: openapiErrorContent
  }
} as const

export const openapiErrorResponse404 = {
  404: {
    description: 'Not Found',
    content: openapiErrorContent
  }
} as const

export const openapiErrorResponse409 = {
  409: {
    description: 'Conflict',
    content: openapiErrorContent
  }
} as const

export const openapiErrorResponse410 = {
  410: {
    description: 'Gone',
    content: openapiErrorContent
  }
} as const

// No `as const` because zod openapi doesn't support readonly for `security`
export const openapiAuthenticatedSecuritySchemas = [
  {
    Bearer: []
  }
]
