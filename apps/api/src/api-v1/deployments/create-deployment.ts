import { assert, parseZodSchema, pick, sha256 } from '@agentic/platform-core'
import { validators } from '@agentic/platform-validators'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { normalizeDeploymentVersion } from '@/lib/deployments/normalize-deployment-version'
import { publishDeployment } from '@/lib/deployments/publish-deployment'
import { validateDeploymentOriginAdapter } from '@/lib/deployments/validate-deployment-origin-adapter'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { createDeploymentQuerySchema } from './schemas'

const route = createRoute({
  description: 'Creates a new deployment within a project.',
  tags: ['deployments'],
  operationId: 'createDeployment',
  method: 'post',
  path: 'deployments',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: createDeploymentQuerySchema,
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
    ...openapiErrorResponse409
  }
})

export function registerV1DeploymentsCreateDeployment(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const user = await ensureAuthUser(c)
    const { publish } = c.req.valid('query')
    const body = c.req.valid('json')
    const teamMember = c.get('teamMember')
    const logger = c.get('logger')
    const { projectId } = body

    // validatePricingPlans(ctx, pricingPlans)

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
    if (publish) {
      assert(
        version,
        400,
        `Deployment "version" field is required to publish deployment "${deploymentId}"`
      )
    }

    if (version) {
      version = normalizeDeploymentVersion({
        deploymentId,
        project,
        version
      })
    }

    // Validate OpenAPI originUrl and originAdapter
    await validateDeploymentOriginAdapter({
      ...pick(body, 'originUrl', 'originAdapter'),
      deploymentId,
      logger
    })

    let [[deployment]] = await db.transaction(async (tx) => {
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

    if (publish) {
      deployment = await publishDeployment(c, {
        deployment,
        version: deployment.version!
      })
    }
    // TODO: validate deployment originUrl, originAdapter, originSchema, and
    // originSchemaVersion

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
