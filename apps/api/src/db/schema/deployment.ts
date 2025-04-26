import { validators } from '@agentic/validators'
import { z } from '@hono/zod-openapi'
import { relations } from 'drizzle-orm'
import { boolean, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core'

import { projects } from './project'
import { teams } from './team'
import {
  type Coupon,
  couponSchema,
  type PricingPlan,
  pricingPlanSchema
} from './types'
import { users } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  cuid,
  deploymentId,
  optionalCuid,
  optionalText,
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
    version: optionalText(),

    enabled: boolean().default(true).notNull(),
    published: boolean().default(false).notNull(),

    description: text().default('').notNull(),
    readme: text().default('').notNull(),

    userId: cuid()
      .notNull()
      .references(() => users.id),
    teamId: optionalCuid().references(() => teams.id),
    projectId: projectId()
      .notNull()
      .references(() => projects.id, {
        onDelete: 'cascade'
      }),

    // TODO: tools?
    // services: jsonb().$type<Service[]>().default([]),

    // TODO: Environment variables & secrets
    // build: jsonb().$type<object>(),
    // env: jsonb().$type<object>(),

    // TODO: metadata config (logo, keywords, etc)
    // TODO: webhooks
    // TODO: third-party auth provider config?

    // Backend API URL
    _url: text().notNull(),

    pricingPlans: jsonb().$type<PricingPlan[]>().notNull(),
    coupons: jsonb().$type<Coupon[]>().default([]).notNull()
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

// TODO: narrow
export const deploymentInsertSchema = createInsertSchema(deployments, {
  id: (schema) =>
    schema.refine((id) => validators.project(id), {
      message: 'Invalid deployment id'
    }),

  hash: (schema) =>
    schema.refine((hash) => validators.deploymentHash(hash), {
      message: 'Invalid deployment hash'
    }),

  _url: (schema) => schema.url(),

  // build: z.object({}),
  // env: z.object({}),
  pricingPlans: z.array(pricingPlanSchema),
  coupons: z.array(couponSchema).optional()
})

export const deploymentSelectSchema = createSelectSchema(deployments, {
  version: z.string().nonempty().optional(),
  teamId: z.string().cuid2().optional(),

  // build: z.object({}),
  // env: z.object({}),
  pricingPlans: z.array(pricingPlanSchema),
  coupons: z.array(couponSchema)
})
  .omit({
    _url: true
  })
  .openapi('Deployment')

export const deploymentUpdateSchema = createUpdateSchema(deployments).pick({
  enabled: true,
  published: true,
  version: true,
  description: true
})

// TODO: add admin select schema which includes all fields?
