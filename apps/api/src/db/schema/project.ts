import { validators } from '@agentic/validators'
import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text
} from '@fisch0920/drizzle-orm/pg-core'
import { z } from '@hono/zod-openapi'

import { deployments, deploymentSelectSchema } from './deployment'
import { teams, teamSelectSchema } from './team'
import { type Webhook } from './types'
import { users, userSelectSchema } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  cuid,
  deploymentId,
  projectId,
  stripeId,
  timestamps
} from './utils'

export const projects = pgTable(
  'projects',
  {
    // namespace/projectName
    id: projectId().primaryKey(),
    ...timestamps,

    name: text().notNull(),
    alias: text(),

    userId: cuid()
      .notNull()
      .references(() => users.id),
    teamId: cuid(),

    // Most recently published Deployment if one exists
    lastPublishedDeploymentId: deploymentId(),

    // Most recent Deployment if one exists
    lastDeploymentId: deploymentId(),

    applicationFeePercent: integer().default(20).notNull(),

    // TODO: This is going to need to vary from dev to prod
    isStripeConnectEnabled: boolean().default(false).notNull(),

    // All deployments share the same underlying proxy secret
    _secret: text().notNull(),

    // Auth token used to access the saasify API on behalf of this project
    _providerToken: text().notNull(),

    // TODO: Full-text search
    _text: text().default('').notNull(),

    _webhooks: jsonb().$type<Webhook[]>().default([]).notNull(),

    // Stripe products corresponding to the stripe plans across deployments
    stripeBaseProductId: stripeId(),
    stripeRequestProductId: stripeId(),

    // Map between metric slugs and stripe product ids
    // [metricSlug: string]: string
    stripeMetricProductIds: jsonb()
      .$type<Record<string, string>>()
      .default({})
      .notNull(),

    // Stripe coupons associated with this project, mapping from unique coupon
    // hash to stripe coupon id.
    // `[hash: string]: string`
    _stripeCouponIds: jsonb()
      .$type<Record<string, string>>()
      .default({})
      .notNull(),

    // Stripe billing plans associated with this project (created lazily),
    // mapping from unique plan hash to stripe plan ids for base and request
    // respectively.
    // `[hash: string]: { basePlanId: string, requestPlanId: string }`
    _stripePlanIds: jsonb()
      .$type<Record<string, { basePlanId: string; requestPlanId: string }>>()
      .default({})
      .notNull(),

    // Connected Stripe account (standard or express).
    // If not defined, then subscriptions for this project route through our
    // main Stripe account.
    // NOTE: the connected account is shared between dev and prod, so we're not using
    // the stripeID utility.
    // TODO: is it wise to share this between dev and prod?
    // TODO: is it okay for this to be public?
    _stripeAccountId: stripeId()
  },
  (table) => [
    index('project_userId_idx').on(table.userId),
    index('project_teamId_idx').on(table.teamId),
    index('project_alias_idx').on(table.alias),
    index('project_createdAt_idx').on(table.createdAt),
    index('project_updatedAt_idx').on(table.updatedAt)
  ]
)

export const projectsRelations = relations(projects, ({ one }) => ({
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
  })
  // deployments: many(deployments, {
  //   relationName: 'deployments'
  // }),
  // publishedDeployments: many(deployments, {
  //   relationName: 'publishedDeployments'
  // })
}))

export type ProjectRelationFields = keyof ReturnType<
  (typeof projectsRelations)['config']
>

export const projectRelationsSchema: z.ZodType<ProjectRelationFields> = z.enum([
  'user',
  'team',
  'lastPublishedDeployment',
  'lastDeployment'
])

export const projectSelectSchema = createSelectSchema(projects, {
  applicationFeePercent: (schema) => schema.nonnegative(),

  stripeMetricProductIds: z.record(z.string(), z.string()).optional()
  // _webhooks: z.array(webhookSchema),
  // _stripeCouponIds: z.record(z.string(), z.string()).optional(),
  // _stripePlanIds: z
  //   .record(
  //     z.string(),
  //     z.object({
  //       basePlanId: z.string(),
  //       requestPlanId: z.string()
  //     })
  //   )
  //   .optional()
})
  .omit({
    _secret: true,
    _providerToken: true,
    _text: true,
    _webhooks: true,
    _stripeCouponIds: true,
    _stripePlanIds: true,
    _stripeAccountId: true
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

    lastPublishedDeployment: z
      .lazy(() => deploymentSelectSchema)
      .optional()
      .openapi('Deployment', { type: 'object' }),

    lastDeployment: z
      .lazy(() => deploymentSelectSchema)
      .optional()
      .openapi('Deployment', { type: 'object' })
  })
  .strip()
  .openapi('Project')

export const projectInsertSchema = createInsertSchema(projects, {
  id: (schema) =>
    schema.refine((id) => validators.project(id), {
      message: 'Invalid project id'
    }),

  name: (schema) =>
    schema.refine((name) => validators.projectName(name), {
      message: 'Invalid project name'
    })
})
  .pick({
    name: true,
    teamId: true
  })
  .strict()

export const projectUpdateSchema = createUpdateSchema(projects)
  .pick({
    name: true,
    alias: true
  })
  .strict()

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
