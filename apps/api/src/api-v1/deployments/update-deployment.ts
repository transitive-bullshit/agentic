import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { tryGetDeployment } from '@/lib/deployments/try-get-deployment'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { deploymentIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Updates a deployment.',
  tags: ['deployments'],
  operationId: 'updateDeployment',
  method: 'post',
  path: 'deployments/{deploymentId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: deploymentIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.deploymentUpdateSchema
        }
      }
    }
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

export function registerV1DeploymentsUpdateDeployment(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { deploymentId } = c.req.valid('param')
    const body = c.req.valid('json')

    // First ensure the deployment exists and the user has access to it
    let deployment = await tryGetDeployment(c, deploymentId)
    assert(deployment, 404, `Deployment not found "${deploymentId}"`)
    await acl(c, deployment, { label: 'Deployment' })

    // Update the deployment
    ;[deployment] = await db
      .update(schema.deployments)
      .set(body)
      .where(eq(schema.deployments.id, deploymentId))
      .returning()
    assert(deployment, 500, `Failed to update deployment "${deploymentId}"`)

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
