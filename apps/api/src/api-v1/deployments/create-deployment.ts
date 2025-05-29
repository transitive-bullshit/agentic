import { assert, parseZodSchema, sha256 } from '@agentic/platform-core'
import { validateAgenticProjectConfig } from '@agentic/platform-schemas'
import { validators } from '@agentic/platform-validators'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { normalizeDeploymentVersion } from '@/lib/deployments/normalize-deployment-version'
import { publishDeployment } from '@/lib/deployments/publish-deployment'
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

    const namespace = teamMember ? teamMember.teamSlug : user.username
    const projectIdentifier = `${namespace}/${body.name}`
    assert(
      validators.projectIdentifier(projectIdentifier),
      400,
      `Invalid project identifier "${projectIdentifier}"`
    )

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.identifier, projectIdentifier),
      with: {
        lastPublishedDeployment: true
      }
    })
    assert(project, 404, `Project not found "${projectIdentifier}"`)
    await acl(c, project, { label: 'Project' })
    const projectId = project.id

    // TODO: investigate better short hash generation
    const hash = sha256().slice(0, 8)
    const deploymentIdentifier = `${project.identifier}@${hash}`
    assert(
      validators.deploymentIdentifier(deploymentIdentifier),
      400,
      `Invalid deployment identifier "${deploymentIdentifier}"`
    )

    let { version } = body
    if (publish) {
      assert(
        version,
        400,
        `Deployment "version" field is required to publish deployment "${deploymentIdentifier}"`
      )
    }

    if (version) {
      version = normalizeDeploymentVersion({
        deploymentIdentifier,
        project,
        version
      })
    }

    // Validate project config, including:
    // - pricing plans
    // - origin adapter config
    // - origin API base URL
    // - origin adapter OpenAPI or MCP specs
    // - tool definitions
    const agenticProjectConfig = await validateAgenticProjectConfig(body, {
      label: `deployment "${deploymentIdentifier}"`,
      strip: true,
      logger
    })

    // Create the deployment
    let [deployment] = await db
      .insert(schema.deployments)
      .values({
        ...agenticProjectConfig,
        identifier: deploymentIdentifier,
        hash,
        userId: user.id,
        teamId: teamMember?.teamId,
        projectId,
        version
      })
      .returning()
    assert(
      deployment,
      500,
      `Failed to create deployment "${deploymentIdentifier}"`
    )

    // Update the project
    await db
      .update(schema.projects)
      .set({
        lastDeploymentId: deployment.id
      })
      .where(eq(schema.projects.id, projectId))

    if (publish) {
      deployment = await publishDeployment(c, {
        deployment,
        version: deployment.version!
      })
    }

    return c.json(parseZodSchema(schema.deploymentSelectSchema, deployment))
  })
}
