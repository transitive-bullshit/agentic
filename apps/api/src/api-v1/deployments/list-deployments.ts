import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { paginationAndPopulateAndFilterDeploymentSchema } from './schemas'

const route = createRoute({
  description: 'Lists deployments the user or team has access to.',
  tags: ['deployments'],
  operationId: 'listDeployments',
  method: 'get',
  path: 'deployments',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: paginationAndPopulateAndFilterDeploymentSchema
  },
  responses: {
    200: {
      description: 'A list of deployments',
      content: {
        'application/json': {
          schema: z.array(schema.deploymentSelectSchema)
        }
      }
    },
    ...openapiErrorResponses
  }
})

export function registerV1DeploymentsListDeployments(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const {
      offset = 0,
      limit = 10,
      sort = 'desc',
      sortBy = 'createdAt',
      populate = [],
      projectId
    } = c.req.valid('query')

    const userId = c.get('userId')
    const teamMember = c.get('teamMember')

    const deployments = await db.query.deployments.findMany({
      where: and(
        teamMember
          ? eq(schema.deployments.teamId, teamMember.teamId)
          : eq(schema.deployments.userId, userId),
        projectId ? eq(schema.deployments.projectId, projectId) : undefined
      ),
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      },
      orderBy: (deployments, { asc, desc }) => [
        sort === 'desc' ? desc(deployments[sortBy]) : asc(deployments[sortBy])
      ],
      offset,
      limit
    })

    return c.json(
      parseZodSchema(z.array(schema.deploymentSelectSchema), deployments)
    )
  })
}
