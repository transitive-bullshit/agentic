import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { schema } from '@/db'
import { acl } from '@/lib/acl'
import { aclAdmin } from '@/lib/acl-admin'
import { setPublicCacheControl } from '@/lib/cache-control'
import { tryGetDeploymentByIdentifier } from '@/lib/deployments/try-get-deployment-by-identifier'
import { env } from '@/lib/env'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { deploymentIdentifierAndPopulateSchema } from './schemas'

const route = createRoute({
  description:
    'Gets a deployment by its public identifier. This route is admin-only.',
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

export function registerV1AdminGetDeploymentByIdentifier(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { deploymentIdentifier, populate = [] } = c.req.valid('query')
    await aclAdmin(c)

    const { project, ...deployment } = await tryGetDeploymentByIdentifier(c, {
      deploymentIdentifier,
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true])),
        project: true
      }
    })
    assert(deployment, 404, `Deployment not found "${deploymentIdentifier}"`)
    assert(
      project,
      404,
      `Project not found for deployment "${deploymentIdentifier}"`
    )
    await acl(c, deployment, { label: 'Deployment' })

    // TODO: ensure that the deployment's project is either public OR the
    // consumer has access to it?

    const hasPopulateProject = populate.includes('project')

    if (env.isProd) {
      // Published deployments are immutable, so cache them for longer in production
      setPublicCacheControl(c.res, deployment.published ? '1h' : '5m')
    } else {
      setPublicCacheControl(c.res, '10s')
    }

    return c.json(
      parseZodSchema(schema.deploymentAdminSelectSchema, {
        ...deployment,
        ...(hasPopulateProject ? { project } : {}),
        _secret: project._secret
      })
    )
  })
}
