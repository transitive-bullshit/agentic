import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import { db, eq, schema } from '@/db'
import { aclPublicProject } from '@/lib/acl-public-project'
import { setPublicCacheControl } from '@/lib/cache-control'
import { env } from '@/lib/env'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { projectIdentifierAndPopulateSchema } from './schemas'

const route = createRoute({
  description:
    'Gets a public project by its public identifier (eg, "@username/project-slug").',
  tags: ['projects'],
  operationId: 'getPublicProjectByIdentifier',
  method: 'get',
  path: 'projects/public/by-identifier',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: projectIdentifierAndPopulateSchema
  },
  responses: {
    200: {
      description: 'A project',
      content: {
        'application/json': {
          schema: schema.projectSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1GetPublicProjectByIdentifier(
  app: OpenAPIHono<DefaultHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { projectIdentifier, populate = [] } = c.req.valid('query')

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.identifier, projectIdentifier),
      with: {
        lastPublishedDeployment: true,
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    aclPublicProject(project, projectIdentifier)
    setPublicCacheControl(c.res, env.isProd ? '1m' : '10s')

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
