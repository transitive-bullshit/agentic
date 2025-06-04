import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { schema } from '@/db'
import { acl } from '@/lib/acl'
import { getDeploymentById } from '@/lib/deployments/get-deployment-by-id'
import { publishDeployment } from '@/lib/deployments/publish-deployment'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { deploymentIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Publishes a deployment.',
  tags: ['deployments'],
  operationId: 'publishDeployment',
  method: 'post',
  path: 'deployments/{deploymentId}/publish',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: deploymentIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.deploymentPublishSchema
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

export function registerV1DeploymentsPublishDeployment(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { deploymentId } = c.req.valid('param')
    const { version } = c.req.valid('json')

    // First ensure the deployment exists and the user has access to it
    const deployment = await getDeploymentById({ deploymentId })
    assert(deployment, 404, `Deployment not found "${deploymentId}"`)
    await acl(c, deployment, { label: 'Deployment' })

    const publishedDeployment = await publishDeployment(c, {
      deployment,
      version
    })

    return c.json(
      parseZodSchema(schema.deploymentSelectSchema, publishedDeployment)
    )
  })
}
