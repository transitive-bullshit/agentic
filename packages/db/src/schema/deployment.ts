import { validators } from '@agentic/platform-validators'
import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text
} from '@fisch0920/drizzle-orm/pg-core'
import { z } from '@hono/zod-openapi'

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  cuid,
  deploymentId,
  projectId,
  timestamps
} from './common'
import { projects } from './project'
import {
  type DeploymentOriginAdapter,
  deploymentOriginAdapterSchema,
  type PricingPlanList,
  pricingPlanListSchema
} from './schemas'
import { teams, teamSelectSchema } from './team'
import { users, userSelectSchema } from './user'

export const deployments = pgTable(
  'deployments',
  {
    // namespace/projectName@hash
    id: deploymentId().primaryKey(),
    ...timestamps,

    hash: text().notNull(),
    version: text(),

    enabled: boolean().default(true).notNull(),
    published: boolean().default(false).notNull(),

    description: text().default('').notNull(),
    readme: text().default('').notNull(),
    iconUrl: text(),

    userId: cuid()
      .notNull()
      .references(() => users.id),
    teamId: cuid().references(() => teams.id),
    projectId: projectId()
      .notNull()
      .references(() => projects.id, {
        onDelete: 'cascade'
      }),

    // TODO: Tool definitions or OpenAPI spec
    // services: jsonb().$type<Service[]>().default([]),

    // TODO: metadata config (logo, keywords, examples, etc)
    // TODO: openapi spec or tool definitions or mcp adapter
    // TODO: webhooks
    // TODO: third-party auth provider config
    // NOTE: will need consumer.authProviders as well as user.authProviders for
    // this because custom oauth credentials that are deployment-specific. will
    // prolly also need to hash the individual AuthProviders in
    // deployment.authProviders to compare across deployments.

    // Origin API URL
    originUrl: text().notNull(),

    // Origin API adapter config (openapi, mcp, hosted externally or internally, etc)
    originAdapter: jsonb().$type<DeploymentOriginAdapter>().notNull(),

    // Array<PricingPlan>
    pricingPlans: jsonb().$type<PricingPlanList>().notNull()

    // coupons: jsonb().$type<Coupon[]>().default([]).notNull()
  },
  (table) => [
    index('deployment_userId_idx').on(table.userId),
    index('deployment_teamId_idx').on(table.teamId),
    index('deployment_projectId_idx').on(table.projectId),
    index('deployment_enabled_idx').on(table.enabled),
    index('deployment_published_idx').on(table.published),
    index('deployment_version_idx').on(table.version),
    index('deployment_createdAt_idx').on(table.createdAt),
    index('deployment_updatedAt_idx').on(table.updatedAt)
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
  // build: z.object({}),
  // env: z.object({}),
  id: (schema) =>
    schema.refine((id) => validators.deploymentId(id), {
      message: 'Invalid deployment id'
    }),

  hash: (schema) =>
    schema.refine((hash) => validators.deploymentHash(hash), {
      message: 'Invalid deployment hash'
    }),

  pricingPlans: pricingPlanListSchema,
  originAdapter: deploymentOriginAdapterSchema
})
  .omit({
    originUrl: true
  })
  .extend({
    user: z
      .lazy(() => userSelectSchema)
      .optional()
      .openapi('User', { type: 'object' }),

    team: z
      .lazy(() => teamSelectSchema)
      .optional()
      .openapi('Team', { type: 'object' }),

    // TODO: Circular references make this schema less than ideal
    project: z.object({}).optional().openapi('Project', { type: 'object' })
  })
  .strip()
  .openapi('Deployment')

export const deploymentInsertSchema = createInsertSchema(deployments, {
  projectId: (schema) =>
    schema.refine((id) => validators.projectId(id), {
      message: 'Invalid project id'
    }),

  iconUrl: (schema) =>
    schema
      .url()
      .describe(
        'Logo image URL to use for this delpoyment. Logos should have a square aspect ratio.'
      ),

  originUrl: (schema) =>
    schema.url().describe(`Base URL of the externally hosted origin API server.

NOTE: Agentic currently only supports \`external\` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.`),

  pricingPlans: pricingPlanListSchema.describe(
    'List of PricingPlans should be available as subscriptions for this deployment.'
  ),
  originAdapter: deploymentOriginAdapterSchema.default({
    location: 'external',
    type: 'raw'
  })
  // .optional()

  // TODO
  // coupons: z.array(couponSchema).optional()
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    hash: true,
    userId: true,
    teamId: true
  })
  .strict()

export const deploymentUpdateSchema = createUpdateSchema(deployments)
  .pick({
    enabled: true,
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
