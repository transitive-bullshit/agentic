import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text
} from 'drizzle-orm/pg-core'

import { getProviderToken } from '@/lib/auth/get-provider-token'

import type { Webhook } from './types'
import { deployments } from './deployment'
import { teams } from './team'
import { users } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  timestamps
} from './utils'

export const projects = pgTable(
  'projects',
  {
    // namespace/projectName
    id: text('id').primaryKey(),
    ...timestamps,

    name: text().notNull(),
    alias: text(),

    userId: text()
      .notNull()
      .references(() => users.id),
    teamId: text().notNull(),

    // Most recently published Deployment if one exists
    lastPublishedDeploymentId: text(),

    // Most recent Deployment if one exists
    lastDeploymentId: text(),

    applicationFeePercent: integer().notNull().default(20),

    // TODO: This is going to need to vary from dev to prod
    isStripeConnectEnabled: boolean().notNull().default(false),

    // All deployments share the same underlying proxy secret
    _secret: text(),

    // Auth token used to access the saasify API on behalf of this project
    _providerToken: text().notNull(),

    // TODO: Full-text search
    _text: text().default(''),

    _webhooks: jsonb().$type<Webhook[]>().default([]),

    // Stripe products corresponding to the stripe plans across deployments
    stripeBaseProduct: text(),
    stripeRequestProduct: text(),

    // [metricSlug: string]: string
    stripeMetricProducts: jsonb().$type<Record<string, string>>().default({}),

    // Stripe coupons associated with this project, mapping from unique coupon
    // hash to stripe coupon id.
    // `[hash: string]: string`
    _stripeCoupons: jsonb().$type<Record<string, string>>().default({}),

    // Stripe billing plans associated with this project (created lazily),
    // mapping from unique plan hash to stripe plan ids for base and request
    // respectively.
    // `[hash: string]: { basePlan: string, requestPlan: string }`
    _stripePlans: jsonb()
      .$type<Record<string, { basePlan: string; requestPlan: string }>>()
      .default({}),

    // Connected Stripe account (standard or express).
    // If not defined, then subscriptions for this project route through our
    // main Stripe account.
    // NOTE: the connected account is shared between dev and prod, so we're not using
    // the stripeID utility.
    // TODO: is it wise to share this between dev and prod?
    // TODO: is it okay for this to be public?
    _stripeAccount: text()
  },
  (table) => [
    index('project_userId_idx').on(table.userId),
    index('project_teamId_idx').on(table.teamId),
    index('project_teamId_idx').on(table.teamId),
    index('project_createdAt_idx').on(table.createdAt),
    index('project_updatedAt_idx').on(table.updatedAt)
  ]
)

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id]
  }),
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id]
  }),
  lastPublishedDeployment: one(deployments, {
    fields: [projects.lastPublishedDeploymentId],
    references: [deployments.id],
    relationName: 'lastPublishedDeployment'
  }),
  lastDeployment: one(deployments, {
    fields: [projects.lastDeploymentId],
    references: [deployments.id],
    relationName: 'lastDeployment'
  }),
  deployments: many(deployments, { relationName: 'deployments' }),
  publishedDeployments: many(deployments, {
    relationName: 'publishedDeployments'
  })
}))

export type Project = typeof projects.$inferSelect

export const projectInsertSchema = createInsertSchema(projects, {
  // TODO: validate project id
  // id: (schema) =>
  //   schema.refine((id) => validators.project(id), 'Invalid project id')
  // TODO: validate project name
  // name: (schema) =>
  //   schema.refine((name) => validators.projectName(name), 'Invalid project name')
})
  .pick({
    id: true,
    name: true,
    userId: true
  })
  .refine((data) => {
    return {
      ...data,
      _providerToken: getProviderToken(data)
    }
  })

export const projectSelectSchema = createSelectSchema(projects).omit({
  _secret: true,
  _providerToken: true,
  _text: true,
  _webhooks: true,
  _stripeCoupons: true,
  _stripePlans: true,
  _stripeAccount: true
})

// TODO: narrow update schema
export const projectUpdateSchema = createUpdateSchema(projects)

export const projectDebugSelectSchema = createSelectSchema(projects).pick({
  id: true,
  name: true,
  alias: true,
  userId: true,
  teamId: true,
  createdAt: true,
  updatedAt: true,
  isStripeConnectEnabled: true,
  lastPublishedDeploymentId: true,
  lastDeploymentId: true
})

// TODO: virtual saasUrl
// TODO: virtual aliasUrl
// TODO: virtual stripeConnectParams
