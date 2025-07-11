import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { paginationAndPopulateProjectSchema } from './schemas'

const route = createRoute({
  description: 'Lists projects owned by the authenticated user or team.',
  tags: ['projects'],
  operationId: 'listProjects',
  method: 'get',
  path: 'projects',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: paginationAndPopulateProjectSchema
  },
  responses: {
    200: {
      description: 'A list of projects',
      content: {
        'application/json': {
          schema: z.array(schema.projectSelectSchema)
        }
      }
    },
    ...openapiErrorResponses
  }
})

export function registerV1ListProjects(app: OpenAPIHono<AuthenticatedHonoEnv>) {
  return app.openapi(route, async (c) => {
    const {
      offset = 0,
      limit = 10,
      sort = 'desc',
      sortBy = 'createdAt',
      populate = []
    } = c.req.valid('query')

    const user = await ensureAuthUser(c)
    const teamMember = c.get('teamMember')
    const isAdmin = user.role === 'admin'

    const projects = await db.query.projects.findMany({
      where: isAdmin
        ? undefined
        : teamMember
          ? eq(schema.projects.teamId, teamMember.teamId)
          : eq(schema.projects.userId, user.id),
      with: {
        lastPublishedDeployment: true,
        ...Object.fromEntries(populate.map((field) => [field, true]))
      },
      orderBy: (projects, { asc, desc }) => [
        sort === 'desc' ? desc(projects[sortBy]) : asc(projects[sortBy])
      ],
      offset,
      limit
    })

    return c.json(parseZodSchema(z.array(schema.projectSelectSchema), projects))
  })
}
