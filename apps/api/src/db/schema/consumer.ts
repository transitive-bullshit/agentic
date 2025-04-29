import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text
} from '@fisch0920/drizzle-orm/pg-core'

import { deployments } from './deployment'
import { projects } from './project'
import { users } from './user'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
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

    token: text().notNull(),
    plan: text(),

    activated: boolean().default(false).notNull(),
    enabled: boolean().default(true).notNull(),

    env: text().default('dev').notNull(),
    coupon: text(),

    // stripe subscription status (synced via webhooks)
    status: text(),

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

    stripeSubscriptionId: stripeId().notNull(),
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

const stripeValidSubscriptionStatuses = new Set([
  'trialing',
  'active',
  'incomplete',
  'past_due'
])

export const consumerInsertSchema = createInsertSchema(consumers).pick({
  token: true,
  plan: true,
  env: true,
  coupon: true,
  source: true,
  userId: true,
  projectId: true,
  deploymentId: true
})

export const consumerSelectSchema =
  createSelectSchema(consumers).openapi('Consumer')

export const consumerUpdateSchema = createUpdateSchema(consumers).refine(
  (data) => {
    return {
      ...data,
      enabled:
        data.plan === 'free' ||
        (data.status && stripeValidSubscriptionStatuses.has(data.status))
    }
  }
)
