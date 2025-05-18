import { validators } from '@agentic/validators'
import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text
} from '@fisch0920/drizzle-orm/pg-core'
import { z } from '@hono/zod-openapi'

import { projects } from './project'
import {
  type PricingPlanList,
  pricingPlanListSchema
  // type Coupon,
  // couponSchema,
} from './schemas'
import { teams, teamSelectSchema } from './team'
import { users, userSelectSchema } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  cuid,
  deploymentId,
  projectId,
  timestamps
} from './utils'

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

    // TODO: metadata config (logo, keywords, etc)
    // TODO: webhooks
    // TODO: third-party auth provider config?

    // Backend API URL
    originUrl: text().notNull(),

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

export type DeploymentRelationFields = keyof ReturnType<
  (typeof deploymentsRelations)['config']
>

export const deploymentRelationsSchema: z.ZodType<DeploymentRelationFields> =
  z.enum(['user', 'team', 'project'])

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

  pricingPlans: pricingPlanListSchema
  // coupons: z.array(couponSchema)
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

  originUrl: (schema) => schema.url(),

  pricingPlans: pricingPlanListSchema

  // TODOp
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
