import { relations } from 'drizzle-orm'
import { boolean, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core'

import type { Coupon, PricingPlan } from './types'
import { projects } from './project'
import { teams } from './team'
import { users } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  cuid,
  timestamps
} from './utils'

export const deployments = pgTable(
  'deployments',
  {
    // namespace/projectName@hash
    id: text().primaryKey(),
    ...timestamps,

    hash: text().notNull(),
    version: text(),

    enabled: boolean().notNull().default(true),
    published: boolean().notNull().default(false),

    description: text().notNull().default(''),
    readme: text().notNull().default(''),

    userId: cuid()
      .notNull()
      .references(() => users.id),
    teamId: cuid().references(() => teams.id),
    projectId: cuid()
      .notNull()
      .references(() => projects.id, {
        onDelete: 'cascade'
      }),

    // TODO: tools?
    // services: jsonb().$type<Service[]>().default([]),

    // Environment variables & secrets
    build: jsonb().$type<object>(),
    env: jsonb().$type<object>(),

    // TODO: metadata config (logo, keywords, etc)
    // TODO: webhooks
    // TODO: third-party auth provider config?

    // Backend API URL
    _url: text().notNull(),

    pricingPlans: jsonb().$type<PricingPlan[]>().notNull(),
    coupons: jsonb().$type<Coupon[]>().notNull().default([])
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

export type Deployment = typeof deployments.$inferSelect

// TODO: narrow
export const deploymentInsertSchema = createInsertSchema(deployments, {
  // TODO: validate deployment id
  // id: (schema) =>
  //   schema.refine((id) => validators.deployment(id), 'Invalid deployment id')
})

export const deploymentSelectSchema = createSelectSchema(deployments).omit({
  _url: true
})

// TODO: narrow
export const deploymentUpdateSchema = createUpdateSchema(deployments).pick({
  enabled: true,
  published: true,
  version: true,
  description: true
})

// TODO: add admin select schema which includes all fields?
