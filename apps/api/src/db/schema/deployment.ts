import { parseZodSchema } from '@agentic/platform-core'
import {
  agenticProjectConfigSchema,
  defaultRequestsRateLimit,
  type OriginAdapter,
  type PricingPlanList,
  type RateLimit,
  resolvedAgenticProjectConfigSchema,
  type Tool,
  type ToolConfig
} from '@agentic/platform-types'
import {
  isValidDeploymentHash,
  parseDeploymentIdentifier
} from '@agentic/platform-validators'
import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex
} from '@fisch0920/drizzle-orm/pg-core'
import { z } from '@hono/zod-openapi'

import { env } from '@/lib/env'

import type { Deployment } from '../types'
import {
  deploymentIdentifierSchema,
  deploymentIdSchema,
  projectIdSchema,
  teamIdSchema,
  userIdSchema
} from '../schemas'
import {
  createSelectSchema,
  createUpdateSchema,
  deploymentIdentifier,
  deploymentPrimaryId,
  pricingIntervalEnum,
  projectId,
  teamId,
  timestamps,
  userId
} from './common'
import { projects, projectSelectSchema } from './project'
import { teams } from './team'
import { users } from './user'

/**
 * A Deployment is a single, immutable instance of a Project. Each deployment
 * contains pricing plans, origin server config (OpenAPI or MCP server), tool
 * definitions, and metadata.
 *
 * Deployments are private to a developer or team until they are published, at
 * which point they are accessible to any customers with access to the parent
 * Project.
 */
export const deployments = pgTable(
  'deployments',
  {
    ...deploymentPrimaryId,
    ...timestamps,

    identifier: deploymentIdentifier().unique().notNull(),
    hash: text().notNull(),
    version: text(),

    published: boolean().default(false).notNull(),

    description: text().default('').notNull(),
    readme: text().default('').notNull(),
    iconUrl: text(),
    sourceUrl: text(),

    userId: userId()
      .notNull()
      .references(() => users.id),
    teamId: teamId().references(() => teams.id),
    projectId: projectId()
      .notNull()
      .references(() => projects.id, {
        onDelete: 'cascade'
      }),

    // Tool definitions exposed by the origin server
    tools: jsonb().$type<Tool[]>().notNull(),

    // Tool configs customize the behavior of tools for different pricing plans
    toolConfigs: jsonb().$type<ToolConfig[]>().default([]).notNull(),

    // Origin API adapter config (url, openapi/mcp/raw, internal/external hosting, etc)
    origin: jsonb().$type<OriginAdapter>().notNull(),

    // Array<PricingPlan>
    pricingPlans: jsonb().$type<PricingPlanList>().notNull(),

    // Which pricing intervals are supported for subscriptions to this project
    pricingIntervals: pricingIntervalEnum()
      .array()
      .default(['month'])
      .notNull(),

    // Default rate limit across all pricing plans
    defaultRateLimit: jsonb()
      .$type<RateLimit>()
      .notNull()
      .default(defaultRequestsRateLimit)

    // TODO: metadata config (logo, keywords, examples, etc)
    // TODO: webhooks
    // TODO: coupons
    // TODO: third-party auth provider config
    // NOTE: will need consumer.authProviders as well as user.authProviders for
    // this because custom oauth credentials that are deployment-specific. will
    // prolly also need to hash the individual AuthProviders in
    // deployment.authProviders to compare across deployments.
  },
  (table) => [
    uniqueIndex('deployment_identifier_idx').on(table.identifier),
    index('deployment_userId_idx').on(table.userId),
    index('deployment_teamId_idx').on(table.teamId),
    index('deployment_projectId_idx').on(table.projectId),
    index('deployment_published_idx').on(table.published),
    index('deployment_version_idx').on(table.version),
    index('deployment_createdAt_idx').on(table.createdAt),
    index('deployment_updatedAt_idx').on(table.updatedAt),
    index('deployment_deletedAt_idx').on(table.deletedAt)
  ]
)

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  user: one(users, {
    fields: [deployments.userId],
    references: [users.id]
  }),
  team: one(teams, {
    fields: [deployments.teamId],
    references: [teams.id]
  }),
  project: one(projects, {
    fields: [deployments.projectId],
    references: [projects.id]
  })
}))

// TODO: virtual hasFreeTier
// TODO: virtual url
// TODO: virtual openApiUrl
// TODO: virtual saasUrl
// TODO: virtual authProviders?
// TODO: virtual openapi spec? (hide openapi.servers)

export const deploymentSelectSchema = createSelectSchema(deployments, {
  id: deploymentIdSchema,
  userId: userIdSchema,
  teamId: teamIdSchema.optional(),
  projectId: projectIdSchema,
  identifier: deploymentIdentifierSchema,

  hash: (schema) =>
    schema.refine((hash) => isValidDeploymentHash(hash), {
      message: 'Invalid deployment hash'
    }),

  version: resolvedAgenticProjectConfigSchema.shape.version,
  description: resolvedAgenticProjectConfigSchema.shape.description,
  readme: resolvedAgenticProjectConfigSchema.shape.readme,
  iconUrl: resolvedAgenticProjectConfigSchema.shape.iconUrl,
  sourceUrl: resolvedAgenticProjectConfigSchema.shape.sourceUrl,
  origin: resolvedAgenticProjectConfigSchema.shape.origin,
  pricingPlans: resolvedAgenticProjectConfigSchema.shape.pricingPlans,
  pricingIntervals: resolvedAgenticProjectConfigSchema.shape.pricingIntervals,
  tools: resolvedAgenticProjectConfigSchema.shape.tools,
  toolConfigs: resolvedAgenticProjectConfigSchema.shape.toolConfigs,
  defaultRateLimit: resolvedAgenticProjectConfigSchema.shape.defaultRateLimit
})
  .omit({
    origin: true
  })
  .extend({
    // user: z
    //   .lazy(() => userSelectSchema)
    //   .optional()
    //   .openapi('User', { type: 'object' }),
    // team: z
    //   .lazy(() => teamSelectSchema)
    //   .optional()
    //   .openapi('Team', { type: 'object' }),
    // project: z
    //   .lazy(() => projectSelectSchema)
    //   .optional()
    //   .openapi('Project', { type: 'object' })

    // TODO: Improve the self-referential typing here that `@hono/zod-openapi`
    // trips up on.
    project: z
      .any()
      .refine(
        (project): boolean =>
          !project || projectSelectSchema.safeParse(project).success,
        {
          message: 'Invalid lastDeployment'
        }
      )
      .transform((project): any => {
        if (!project) return undefined
        return projectSelectSchema.parse(project)
      })
      .optional()
    // .openapi('Project', { type: 'object' })

    // TODO: Circular references make this schema less than ideal
    // project: z.object({}).optional().openapi('Project', { type: 'object' })
  })
  .strip()
  // These are all derived virtual URLs that are not stored in the database
  .extend({
    /**
     * The public base HTTP URL for the deployment supporting HTTP POST requests
     * for individual tools at `/tool-name` subpaths.
     *
     * @example https://gateway.agentic.com/@agentic/search@latest
     */
    gatewayBaseUrl: z
      .string()
      .url()
      .describe(
        'The public base HTTP URL for the deployment supporting HTTP POST requests for individual tools at `/tool-name` subpaths.'
      ),

    /**
     * The public MCP URL for the deployment supporting the Streamable HTTP
     * transport.
     *
     * @example https://gateway.agentic.com/@agentic/search@latest/mcp
     */
    gatewayMcpUrl: z
      .string()
      .url()
      .describe(
        'The public MCP URL for the deployment supporting the Streamable HTTP transport.'
      ),

    /**
     * The public marketplace URL for the deployment's project.
     *
     * Note that only published deployments are visible on the marketplace.
     *
     * @example https://agentic.so/marketplace/projects/@agentic/search
     */
    marketplaceUrl: z
      .string()
      .url()
      .describe("The public marketplace URL for the deployment's project."),

    /**
     * A private admin URL for managing the deployment. This URL is only accessible
     * by project owners.
     *
     * @example https://agentic.so/app/projects/@agentic/search/deployments/123
     */
    adminUrl: z
      .string()
      .url()
      .describe(
        'A private admin URL for managing the deployment. This URL is only accessible by project owners.'
      )
  })
  .describe(
    `A Deployment is a single, immutable instance of a Project. Each deployment contains pricing plans, origin server config (OpenAPI or MCP server), tool definitions, and metadata.

Deployments are private to a developer or team until they are published, at which point they are accessible to any customers with access to the parent Project.`
  )
  .openapi('Deployment')

export function parseDeploymentSelectSchema(
  deployment: Record<string, any>
): Deployment {
  const { projectIdentifier, deploymentIdentifier } = parseDeploymentIdentifier(
    deployment.identifier
  )

  return parseZodSchema(deploymentSelectSchema, {
    ...deployment,
    gatewayBaseUrl: `${env.AGENTIC_GATEWAY_BASE_URL}/${deploymentIdentifier}`,
    gatewayMcpUrl: `${env.AGENTIC_GATEWAY_BASE_URL}/${deploymentIdentifier}/mcp`,
    marketplaceUrl: `${env.AGENTIC_WEB_BASE_URL}/marketplace/projects/${projectIdentifier}`,
    adminUrl: `${env.AGENTIC_WEB_BASE_URL}/app/projects/${projectIdentifier}/deployments/${deployment.hash}`
  })
}

export function parseDeploymentSelectArraySchema(
  deployments: Record<string, any>[]
): Deployment[] {
  return deployments.map(parseDeploymentSelectSchema)
}

export const deploymentAdminSelectSchema = deploymentSelectSchema
  .extend({
    origin: resolvedAgenticProjectConfigSchema.shape.origin,
    _secret: z.string().nonempty()
  })
  .openapi('AdminDeployment')

export function parseDeploymentAdminSelectSchema(
  deployment: Record<string, any>
): z.infer<typeof deploymentAdminSelectSchema> {
  return parseZodSchema(deploymentAdminSelectSchema, {
    ...parseDeploymentSelectSchema(deployment),
    ...deployment
  })
}

export const deploymentInsertSchema = agenticProjectConfigSchema.strict()

// TODO: Deployments should be immutable, so we should not allow updates aside
// from publishing. But editing a project's description should be possible from
// the admin UI, so maybe we allow only updates to some properties? Or we
// denormalize these fields in `project`?
export const deploymentUpdateSchema = createUpdateSchema(deployments)
  .pick({
    deletedAt: true,
    description: true
  })
  .strict()

export const deploymentPublishSchema = createUpdateSchema(deployments, {
  version: z.string().nonempty()
})
  .pick({
    version: true
  })
  .strict()
