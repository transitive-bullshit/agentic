import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text
} from '@fisch0920/drizzle-orm/pg-core'
import { z } from '@hono/zod-openapi'

import { deployments, deploymentSelectSchema } from './deployment'
import { projects, projectSelectSchema } from './project'
import { users, userSelectSchema } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  cuid,
  deploymentId,
  id,
  projectId,
  stripeId,
  timestamps
} from './utils'

// TODO: Consumers should be valid for any enabled project like in RapidAPI and GCP.
// This may require a separate model to aggregate User Applications.
// https://docs.rapidapi.com/docs/keys#section-different-api-keys-per-application

export const consumers = pgTable(
  'consumers',
  {
    id,
    ...timestamps,

    // API token for this consumer
    token: text().notNull(),
    plan: text(),

    activated: boolean().default(false).notNull(),
    enabled: boolean().default(true).notNull(),

    env: text().default('dev').notNull(),
    coupon: text(),

    // only used during initial creation
    source: text(),

    userId: cuid()
      .notNull()
      .references(() => users.id),

    // The project this user is subscribed to
    projectId: projectId()
      .notNull()
      .references(() => projects.id, {
        onDelete: 'cascade'
      }),

    // The specific deployment this user is subscribed to
    // (since pricing can change across deployment versions)
    deploymentId: deploymentId()
      .notNull()
      .references(() => deployments.id, {
        onDelete: 'cascade'
      }),

    // stripe subscription status (synced via webhooks)
    stripeStatus: text(),

    stripeSubscriptionId: stripeId(),
    stripeSubscriptionBaseItemId: stripeId(),
    stripeSubscriptionRequestItemId: stripeId(),

    // [metricSlug: string]: string
    stripeSubscriptionMetricItems: jsonb()
      .$type<Record<string, string>>()
      .default({})
      .notNull(),

    // Denormalized from User or possibly separate for stripe connect
    // TODO: is this necessary?
    _stripeCustomerId: stripeId().notNull()
  },
  (table) => [
    index('consumer_token_idx').on(table.token),
    index('consumer_env_idx').on(table.env),
    index('consumer_userId_idx').on(table.userId),
    index('consumer_projectId_idx').on(table.projectId),
    index('consumer_deploymentId_idx').on(table.deploymentId),
    index('consumer_createdAt_idx').on(table.createdAt),
    index('consumer_updatedAt_idx').on(table.updatedAt)
  ]
)

export const consumersRelations = relations(consumers, ({ one }) => ({
  user: one(users, {
    fields: [consumers.userId],
    references: [users.id]
  }),
  project: one(projects, {
    fields: [consumers.projectId],
    references: [projects.id]
  }),
  deployment: one(deployments, {
    fields: [consumers.deploymentId],
    references: [deployments.id]
  })
}))

export type ConsumerRelationFields = keyof ReturnType<
  (typeof consumersRelations)['config']
>

export const consumerRelationsSchema: z.ZodType<ConsumerRelationFields> =
  z.enum(['user', 'project', 'deployment'])

export const consumerSelectSchema = createSelectSchema(consumers, {
  stripeSubscriptionMetricItems: z.record(z.string(), z.string())
})
  .omit({
    _stripeCustomerId: true
  })
  .extend({
    user: z
      .lazy(() => userSelectSchema)
      .optional()
      .openapi('User', { type: 'object' }),

    project: z
      .lazy(() => projectSelectSchema)
      .optional()
      .openapi('Project', { type: 'object' }),

    deployment: z
      .lazy(() => deploymentSelectSchema)
      .optional()
      .openapi('Deployment', { type: 'object' })
  })
  .openapi('Consumer')

export const consumerInsertSchema = createInsertSchema(consumers)
  .pick({
    plan: true,
    env: true,
    coupon: true,
    source: true,
    deploymentId: true
  })
  .strict()
