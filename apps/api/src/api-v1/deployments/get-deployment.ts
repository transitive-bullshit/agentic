import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { schema } from '@/db'
import { acl } from '@/lib/acl'
import { getDeploymentById } from '@/lib/deployments/get-deployment-by-id'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { deploymentIdParamsSchema, populateDeploymentSchema } from './schemas'

const route = createRoute({
  description: 'Gets a deployment by its ID',
  tags: ['deployments'],
  operationId: 'getDeployment',
  method: 'get',
  path: 'deployments/{deploymentId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: deploymentIdParamsSchema,
    query: populateDeploymentSchema
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

export function registerV1GetDeployment(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { deploymentId } = c.req.valid('param')
    const { populate = [] } = c.req.valid('query')

    const deployment = await getDeploymentById({
      deploymentId,
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(deployment, 404, `Deployment not found "${deploymentId}"`)
    await acl(c, deployment, { label: 'Deployment' })

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
