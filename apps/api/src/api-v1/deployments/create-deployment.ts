import { resolveAgenticProjectConfig } from '@agentic/platform'
import { assert, parseZodSchema, sha256 } from '@agentic/platform-core'
import {
  isValidDeploymentIdentifier,
  parseProjectIdentifier
} from '@agentic/platform-validators'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { normalizeDeploymentVersion } from '@/lib/deployments/normalize-deployment-version'
import { publishDeployment } from '@/lib/deployments/publish-deployment'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import { env } from '@/lib/env'
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

export function registerV1CreateDeployment(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const user = await ensureAuthUser(c)
    const { publish } = c.req.valid('query')
    const body = c.req.valid('json')
    const teamMember = c.get('teamMember')
    const logger = c.get('logger')

    const inputNamespace = teamMember ? teamMember.teamSlug : user.username
    const inputProjectIdentifier = `@${inputNamespace}/${body.name}`
    const { projectIdentifier, projectNamespace, projectName } =
      parseProjectIdentifier(inputProjectIdentifier)

    let project = await db.query.projects.findFirst({
      where: eq(schema.projects.identifier, projectIdentifier),
      with: {
        lastPublishedDeployment: true
      }
    })

    if (!project) {
      // Used for testing e2e fixtures in the development marketplace
      const isPrivate = !(
        (user.username === 'dev' && env.isDev) ||
        user.username === 'agentic'
      )

      // Used to simplify recreating the demo `@agentic/search` project during
      // development while we're frequently resetting the database
      const secret =
        projectIdentifier === '@agentic/search'
          ? env.AGENTIC_SEARCH_PROXY_SECRET
          : await sha256()

      // Upsert the project if it doesn't already exist
      // The typecast is necessary here because we're not populating the
      // lastPublishedDeployment, but that's fine because it's a new project
      // so it will be empty anyway.
      project = (
        await db
          .insert(schema.projects)
          .values({
            identifier: projectIdentifier,
            namespace: projectNamespace,
            name: projectName,
            userId: user.id,
            teamId: teamMember?.teamId,
            private: isPrivate,
            _secret: secret
          })
          .returning()
      )[0] as typeof project
    }

    assert(project, 404, `Project not found "${projectIdentifier}"`)
    await acl(c, project, { label: 'Project' })
    const projectId = project.id

    // TODO: investigate better short hash generation
    const hash = (await sha256()).slice(0, 8)
    const deploymentIdentifier = `${project.identifier}@${hash}`
    assert(
      isValidDeploymentIdentifier(deploymentIdentifier),
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
    const agenticProjectConfig = await resolveAgenticProjectConfig(body, {
      label: `deployment "${deploymentIdentifier}"`,
      logger
    })

    // Create the deployment
    let [deployment] = await db
      .insert(schema.deployments)
      .values({
        iconUrl: user.image,
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
