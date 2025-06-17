import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { projectIdentifierAndPopulateSchema } from './schemas'

const route = createRoute({
  description:
    'Gets a project by its public identifier (eg, "@username/project-name").',
  tags: ['projects'],
  operationId: 'getProjectByIdentifier',
  method: 'get',
  path: 'projects/by-identifier',
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

export function registerV1GetProjectByIdentifier(
  app: OpenAPIHono<AuthenticatedHonoEnv>
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
    assert(project, 404, `Project not found "${projectIdentifier}"`)
    await acl(c, project, { label: 'Project' })

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
