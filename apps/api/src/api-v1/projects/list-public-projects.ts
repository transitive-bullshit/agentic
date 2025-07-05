import { env } from 'node:process'

import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import {
  and,
  arrayContains,
  db,
  eq,
  isNotNull,
  isNull,
  not,
  or,
  schema
} from '@/db'
import { setPublicCacheControl } from '@/lib/cache-control'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { listPublicProjectsQuerySchema } from './schemas'

const route = createRoute({
  description:
    'Lists projects that have been published publicly to the marketplace.',
  tags: ['projects'],
  operationId: 'listPublicProjects',
  method: 'get',
  path: 'projects/public',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: listPublicProjectsQuerySchema
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

export function registerV1ListPublicProjects(app: OpenAPIHono<DefaultHonoEnv>) {
  return app.openapi(route, async (c) => {
    const {
      offset = 0,
      limit = 10,
      sort = 'desc',
      sortBy = 'createdAt',
      populate = [],
      tag,
      notTag
    } = c.req.valid('query')

    const projects = await db.query.projects.findMany({
      // List projects that are not private and have at least one published deployment
      // And optionally match a given tag
      where: and(
        eq(schema.projects.private, false),
        isNotNull(schema.projects.lastPublishedDeploymentId),
        tag ? arrayContains(schema.projects.tags, [tag]) : undefined,
        notTag
          ? or(
              not(arrayContains(schema.projects.tags, [notTag])),
              isNull(schema.projects.tags)
            )
          : undefined
      ),
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
    setPublicCacheControl(c.res, env.isProd ? '1m' : '10s')

    return c.json(parseZodSchema(z.array(schema.projectSelectSchema), projects))
  })
}
