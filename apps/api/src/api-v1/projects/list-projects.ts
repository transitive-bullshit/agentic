import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { parseZodSchema } from '@/lib/utils'

import { paginationAndPopulateProjectSchema } from './schemas'

const route = createRoute({
  description: 'Lists projects the authenticated user has access to.',
  tags: ['projects'],
  operationId: 'listProjects',
  method: 'get',
  path: 'projects',
  security: [{ bearerAuth: [] }],
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
    }
    // TODO
    // ...openApiErrorResponses
  }
})

export function registerV1ProjectsListProjects(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const {
      offset = 0,
      limit = 10,
      sort = 'desc',
      sortBy = 'createdAt',
      populate = []
    } = c.req.valid('query')

    const user = c.get('user')
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
