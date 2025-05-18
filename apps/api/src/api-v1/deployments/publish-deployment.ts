import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'
import semver from 'semver'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { tryGetDeployment } from '@/lib/try-get-deployment'
import { assert, parseZodSchema } from '@/lib/utils'

import { deploymentIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Publishes a deployment.',
  tags: ['deployments'],
  operationId: 'publishDeployment',
  method: 'post',
  path: 'deployments/{deploymentId}/publish',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: deploymentIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.deploymentPublishSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'A deployment object',
      content: {
        'application/json': {
          schema: schema.deploymentSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1DeploymentsPublishDeployment(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { deploymentId } = c.req.valid('param')
    const body = c.req.valid('json')
    const version = semver.clean(body.version)
    assert(version, 400, `Invalid semver version "${body.version}"`)

    // First ensure the deployment exists and the user has access to it
    let deployment = await tryGetDeployment(c, deploymentId)
    assert(deployment, 404, `Deployment not found "${deploymentId}"`)
    await acl(c, deployment, { label: 'Deployment' })

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, deployment.projectId),
      with: {
        lastPublishedDeployment: true
      }
    })
    assert(project, 404, `Project not found "${deployment.projectId}"`)
    await acl(c, project, { label: 'Project' })

    const lastPublishedVersion =
      project.lastPublishedDeployment?.version || '0.0.0'

    assert(
      semver.valid(version),
      400,
      `Invalid semver version "${version}" for deployment "${deployment.id}"`
    )
    assert(
      semver.gt(version, lastPublishedVersion),
      400,
      `Invalid semver version: "${version}" must be greater than current published version "${lastPublishedVersion}" for deployment "${deployment.id}"`
    )

    // TODO: enforce certain semver constraints
    // - pricing changes require major version update
    // - deployment shouldn't already be published?
    // - any others?

    // Update the deployment and project together in a transaction
    ;[[deployment]] = await db.transaction(async (tx) => {
      return Promise.all([
        // Update the deployment
        tx
          .update(schema.deployments)
          .set({
            published: true,
            version
          })
          .where(eq(schema.deployments.id, deploymentId))
          .returning(),

        tx
          .update(schema.projects)
          .set({
            lastPublishedDeploymentId: deploymentId
          })
          .where(eq(schema.projects.id, project.id))

        // TODO: add publishDeploymentLogEntry
      ])
    })
    assert(deployment, 500, `Failed to update deployment "${deploymentId}"`)

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
