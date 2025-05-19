import type { OpenAPIHono } from '@hono/zod-openapi'

export const openapiErrorResponses = {
  400: {
    $ref: '#/components/responses/400'
  },
  401: {
    $ref: '#/components/responses/401'
  },
  403: {
    $ref: '#/components/responses/403'
  }
} as const

export const openapiErrorResponse404 = {
  404: {
    $ref: '#/components/responses/404'
  }
} as const

export const openapiErrorResponse409 = {
  409: {
    $ref: '#/components/responses/409'
  }
} as const

export const openapiErrorResponse410 = {
  410: {
    $ref: '#/components/responses/410'
  }
} as const

// No `as const` because zod openapi doesn't support readonly for `security`
export const openapiAuthenticatedSecuritySchemas = [
  {
    Bearer: []
  }
]

const openapiErrorContent = {
  'application/json': {
    schema: {
      type: 'object' as const,
      properties: {
        error: {
          type: 'string' as const
        }
      },
      required: ['error' as const]
    }
  }
}

export function registerOpenAPIErrorResponses(app: OpenAPIHono) {
  app.openAPIRegistry.registerComponent('responses', '400', {
    description: 'Bad Request',
    content: openapiErrorContent
  })

  app.openAPIRegistry.registerComponent('responses', '401', {
    description: 'Unauthorized',
    content: openapiErrorContent
  })

  app.openAPIRegistry.registerComponent('responses', '403', {
    description: 'Forbidden',
    content: openapiErrorContent
  })

  app.openAPIRegistry.registerComponent('responses', '404', {
    description: 'Not Found',
    content: openapiErrorContent
  })

  app.openAPIRegistry.registerComponent('responses', '409', {
    description: 'Conflict',
    content: openapiErrorContent
  })

  app.openAPIRegistry.registerComponent('responses', '410', {
    description: 'Gone',
    content: openapiErrorContent
  })
}
