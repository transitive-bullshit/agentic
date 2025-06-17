import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import { db, eq, schema } from '@/db'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { projectIdentifierAndPopulateSchema } from './schemas'

const route = createRoute({
  description:
    'Gets a public project by its public identifier (eg, "@username/project-name").',
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
    assert(
      project && project.private && project.lastPublishedDeploymentId,
      404,
      `Public project not found "${projectIdentifier}"`
    )

    return c.json(parseZodSchema(schema.projectSelectSchema, project))
  })
}
