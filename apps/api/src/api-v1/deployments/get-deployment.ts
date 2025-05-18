import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { tryGetDeployment } from '@/lib/try-get-deployment'
import { assert, parseZodSchema } from '@/lib/utils'

import { deploymentIdParamsSchema, populateDeploymentSchema } from './schemas'

const route = createRoute({
  description: 'Gets a deployment',
  tags: ['deployments'],
  operationId: 'getdeployment',
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

export function registerV1DeploymentsGetDeployment(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { deploymentId } = c.req.valid('param')
    const { populate = [] } = c.req.valid('query')

    const deployment = await tryGetDeployment(c, deploymentId, {
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(deployment, 404, `Deployment not found "${deploymentId}"`)
    await acl(c, deployment, { label: 'Deployment' })

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
