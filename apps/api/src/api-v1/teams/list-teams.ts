import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, paginationSchema, schema } from '@/db'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponses
} from '@/lib/openapi-utils'

const route = createRoute({
  description: 'Lists all teams the authenticated user belongs to.',
  tags: ['teams'],
  operationId: 'listTeams',
  method: 'get',
  path: 'teams',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: paginationSchema
  },
  responses: {
    200: {
      description: 'A list of teams',
      content: {
        'application/json': {
          schema: z.array(schema.teamSelectSchema)
        }
      }
    },
    ...openapiErrorResponses
  }
})

export function registerV1ListTeams(app: OpenAPIHono<AuthenticatedHonoEnv>) {
  return app.openapi(route, async (c) => {
    const {
      offset = 0,
      limit = 10,
      sort = 'desc',
      sortBy = 'createdAt'
    } = c.req.valid('query')
    const userId = c.get('userId')

    // schema.teamMembers._.columns

    const teamMembers = await db.query.teamMembers.findMany({
      where: eq(schema.teamMembers.userId, userId),
      with: {
        team: true
      },
      orderBy: (teamMembers, { asc, desc }) => [
        sort === 'desc' ? desc(teamMembers[sortBy]) : asc(teamMembers[sortBy])
      ],
      offset,
      limit
    })

    return c.json(parseZodSchema(z.array(schema.teamSelectSchema), teamMembers))
  })
}
