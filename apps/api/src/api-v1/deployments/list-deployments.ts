import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { tryGetProjectByIdentifier } from '@/lib/projects/try-get-project-by-identifier'

import { paginationAndPopulateAndFilterDeploymentSchema } from './schemas'

const route = createRoute({
  description:
    'Lists deployments the user or team has access to, optionally filtering by project.',
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
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const {
      offset = 0,
      limit = 10,
      sort = 'desc',
      sortBy = 'createdAt',
      populate = [],
      projectIdentifier,
      deploymentIdentifier
    } = c.req.valid('query')

    const userId = c.get('userId')
    const teamMember = c.get('teamMember')
    const user = await ensureAuthUser(c)
    const isAdmin = user.role === 'admin'

    let projectId: string | undefined

    if (projectIdentifier) {
      const project = await tryGetProjectByIdentifier(c, {
        projectIdentifier
      })
      await acl(c, project, { label: 'Project' })
      projectId = project.id
    }

    const deployments = await db.query.deployments.findMany({
      where: and(
        isAdmin
          ? undefined
          : teamMember
            ? eq(schema.deployments.teamId, teamMember.teamId)
            : eq(schema.deployments.userId, userId),
        projectId ? eq(schema.deployments.projectId, projectId) : undefined,
        deploymentIdentifier
          ? eq(schema.deployments.identifier, deploymentIdentifier)
          : undefined
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
