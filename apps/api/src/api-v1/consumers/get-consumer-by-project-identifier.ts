import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { aclPublicProject } from '@/lib/acl-public-project'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { projectIdentifierAndPopulateConsumerSchema } from './schemas'

const route = createRoute({
  description:
    'Gets a consumer for the authenticated user and the given project identifier.',
  tags: ['consumers'],
  operationId: 'getConsumerByProjectIdentifier',
  method: 'get',
  path: 'consumers/by-project-identifier',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: projectIdentifierAndPopulateConsumerSchema
  },
  responses: {
    200: {
      description: 'A consumer object',
      content: {
        'application/json': {
          schema: schema.consumerSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1GetConsumerByProjectIdentifier(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { projectIdentifier, populate = [] } = c.req.valid('query')
    const userId = c.get('userId')

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.identifier, projectIdentifier)
    })
    assert(project, 404, `Project not found "${projectIdentifier}"`)
    aclPublicProject(project)

    const consumer = await db.query.consumers.findFirst({
      where: and(
        eq(schema.consumers.userId, userId),
        eq(schema.consumers.projectId, project.id)
      ),
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(
      consumer,
      404,
      `Consumer not found for user "${userId}" and project "${projectIdentifier}"`
    )
    await acl(c, consumer, { label: 'Consumer' })

    return c.json(parseZodSchema(schema.consumerSelectSchema, consumer))
  })
}
