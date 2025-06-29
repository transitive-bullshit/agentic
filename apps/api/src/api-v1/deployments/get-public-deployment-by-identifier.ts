import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import { schema } from '@/db'
import { aclPublicProject } from '@/lib/acl-public-project'
import { setPublicCacheControl } from '@/lib/cache-control'
import { tryGetDeploymentByIdentifier } from '@/lib/deployments/try-get-deployment-by-identifier'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { deploymentIdentifierAndPopulateSchema } from './schemas'

const route = createRoute({
  description:
    'Gets a public deployment by its identifier (eg, "@username/project-slug@latest").',
  tags: ['deployments'],
  operationId: 'getPublicDeploymentByIdentifier',
  method: 'get',
  path: 'deployments/public/by-identifier',
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

export function registerV1GetPublicDeploymentByIdentifier(
  app: OpenAPIHono<DefaultHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { deploymentIdentifier, populate = [] } = c.req.valid('query')

    const deployment = await tryGetDeploymentByIdentifier(c, {
      deploymentIdentifier,
      with: {
        project: true,
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(deployment, 404, `Deployment not found "${deploymentIdentifier}"`)
    assert(
      deployment.project,
      404,
      `Project not found for deployment "${deploymentIdentifier}"`
    )
    aclPublicProject(deployment.project!)

    if (deployment.published) {
      // Note that published deployments should be immutable
      setPublicCacheControl(c.res, '1m')
    } else {
      setPublicCacheControl(c.res, '10s')
    }

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
