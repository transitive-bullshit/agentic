import { validators } from '@agentic/validators'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'
import semver from 'semver'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponse410,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { assert, parseZodSchema, sha256 } from '@/lib/utils'

const route = createRoute({
  description: 'Creates a new deployment within a project.',
  tags: ['deployments'],
  operationId: 'createDeployment',
  method: 'post',
  path: 'deployments',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.deploymentInsertSchema
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
    ...openapiErrorResponse404,
    ...openapiErrorResponse409,
    ...openapiErrorResponse410
  }
})

export function registerV1DeploymentsCreateDeployment(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const user = await ensureAuthUser(c)
    const body = c.req.valid('json')
    const teamMember = c.get('teamMember')
    const { projectId } = body

    // validatePricingPlans(ctx, pricingPlans)

    // TODO: OpenAPI support

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
      with: {
        lastPublishedDeployment: true
      }
    })
    assert(project, 404, `Project not found "${projectId}"`)
    await acl(c, project, { label: 'Project' })

    // TODO: investigate better short hash generation
    const hash = sha256().slice(0, 8)
    const deploymentId = `${project.id}@${hash}`
    assert(
      validators.deploymentId(deploymentId),
      400,
      `Invalid deployment id "${deploymentId}"`
    )

    let { version } = body

    if (version) {
      version = semver.clean(version) ?? undefined
      assert(
        version && semver.valid(version),
        400,
        `Invalid semver version "${version}"`
      )

      const lastPublishedVersion =
        project.lastPublishedDeployment?.version ?? '0.0.0'

      assert(
        semver.gt(version, lastPublishedVersion),
        400,
        `Semver version "${version}" must be greater than last published version "${lastPublishedVersion}"`
      )
    }

    const [[deployment]] = await db.transaction(async (tx) => {
      return Promise.all([
        // Create the deployment
        tx
          .insert(schema.deployments)
          .values({
            ...body,
            id: deploymentId,
            hash,
            userId: user.id,
            teamId: teamMember?.teamId,
            projectId,
            version
          })
          .returning(),

        // Update the project
        tx
          .update(schema.projects)
          .set({
            lastDeploymentId: deploymentId
          })
          .where(eq(schema.projects.id, projectId))
      ])
    })
    assert(deployment, 500, `Failed to create deployment "${deploymentId}"`)

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
