import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
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
  description: 'Gets a deployment by its public identifier (admin-only)',
  tags: ['admin', 'deployments'],
  operationId: 'adminGetDeploymentByIdentifier',
  method: 'get',
  path: 'admin/deployments/by-identifier',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: deploymentIdentifierAndPopulateSchema
  },
  responses: {
    200: {
      description: 'An admin deployment object',
      content: {
        'application/json': {
          schema: schema.deploymentAdminSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1AdminDeploymentsGetDeploymentByIdentifier(
  app: OpenAPIHono<AuthenticatedEnv>
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

    // TODO
    // TODO: switch from published to publishedAt?
    // if (deployment.published) {
    //   c.res.headers.set(
    //     'cache-control',
    //     'public, max-age=1, s-maxage=1 stale-while-revalidate=1'
    //   )
    // } else {
    //   c.res.headers.set(
    //     'cache-control',
    //     'public, max-age=120, s-maxage=120, stale-while-revalidate=10'
    //   )
    // }

    return c.json(
      parseZodSchema(schema.deploymentAdminSelectSchema, deployment)
    )
  })
}
