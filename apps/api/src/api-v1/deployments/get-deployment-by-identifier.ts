import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { schema } from '@/db'
import { acl } from '@/lib/acl'
import { tryGetDeploymentByIdentifier } from '@/lib/deployments/try-get-deployment-by-identifier'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { deploymentIdentifierAndPopulateSchema } from './schemas'

const route = createRoute({
  description:
    'Gets a deployment by its identifier (eg, "@username/project-name@latest").',
  tags: ['deployments'],
  operationId: 'getDeploymentByIdentifier',
  method: 'get',
  path: 'deployments/by-identifier',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: deploymentIdentifierAndPopulateSchema
  },
  responses: {
    200: {
      description: 'A deployment object',
      content: {
        'application/json': {
          schema: schema.deploymentSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1GetDeploymentByIdentifier(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { deploymentIdentifier, populate = [] } = c.req.valid('query')

    const deployment = await tryGetDeploymentByIdentifier(c, {
      deploymentIdentifier,
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(deployment, 404, `Deployment not found "${deploymentIdentifier}"`)
    await acl(c, deployment, { label: 'Deployment' })

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
