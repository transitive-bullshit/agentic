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
  id,
  projectId,
  stripeId,
  timestamps
} from './common'
import { deployments } from './deployment'
import { projects } from './project'
import {
  type StripeSubscriptionItemIdMap,
  stripeSubscriptionItemIdMapSchema
} from './schemas'
import { users } from './user'

// TODO: Consumers should be valid for any enabled project like in RapidAPI and GCP.
// This may require a separate model to aggregate User Applications.
// https://docs.rapidapi.com/docs/keys#section-different-api-keys-per-application

/**
 * A `Consumer` is a user who has subscribed to a `Project`.
 *
 * Consumers are used to track usage and billing for a project.
 *
 * Consumers are linked to a corresponding Stripe Customer and Subscription.
 * The Stripe customer will either be the user's default Stripe Customer for
 * the platform account, or a customer on the project's connected Stripe
 * account if the project has Stripe Connect enabled.
 */
export const consumers = pgTable(
  'consumers',
  {
    id,
    ...timestamps,

    // API token for this consumer
    token: text().notNull(),

    // The slug of the PricingPlan in the target deployment that this consumer
    // is subscribed to.
    plan: text(),

    // Whether the consumer has made at least one successful API call after
    // initializing their subscription.
    activated: boolean().default(false).notNull(),

    // Whether the consumer's subscription is currently active
    enabled: boolean().default(true).notNull(),

    // TODO: Re-add coupon support
    // coupon: text(),

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

    // The specific deployment this user is subscribed to, since pricing can
    // change across deployment versions)
    deploymentId: deploymentId()
      .notNull()
      .references(() => deployments.id, {
        onDelete: 'cascade'
      }),

    // Stripe subscription status (synced via webhooks)
    stripeStatus: text(),

    // Main Stripe Subscription id
    _stripeSubscriptionId: stripeId(),

    // [pricingPlanLineItemSlug: string]: string
    _stripeSubscriptionItemIdMap: jsonb()
      .$type<StripeSubscriptionItemIdMap>()
      .default({})
      .notNull(),

    // Denormalized from User or possibly separate for stripe connect
    // TODO: is this necessary?
    _stripeCustomerId: stripeId().notNull()
  },
  (table) => [
    index('consumer_token_idx').on(table.token),
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

export const consumerSelectSchema = createSelectSchema(consumers, {
  _stripeSubscriptionItemIdMap: stripeSubscriptionItemIdMapSchema,

  deploymentId: (schema) =>
    schema.refine((id) => validators.deploymentId(id), {
      message: 'Invalid deployment id'
    }),

  projectId: (schema) =>
    schema.refine((id) => validators.projectId(id), {
      message: 'Invalid project id'
    })
})
  .omit({
    _stripeSubscriptionId: true,
    _stripeSubscriptionItemIdMap: true,
    _stripeCustomerId: true
  })
  // .extend({
  //   user: z
  //     .lazy(() => userSelectSchema)
  //     .optional()
  //     .openapi('User', { type: 'object' }),

  //   project: z
  //     .lazy(() => projectSelectSchema)
  //     .optional()
  //     .openapi('Project', { type: 'object' }),

  //   deployment: z
  //     .lazy(() => deploymentSelectSchema)
  //     .optional()
  //     .openapi('Deployment', { type: 'object' })
  // })
  .strip()
  .openapi('Consumer')

export const consumerInsertSchema = createInsertSchema(consumers, {
  deploymentId: (schema) =>
    schema.refine((id) => validators.deploymentId(id), {
      message: 'Invalid deployment id'
    }),

  plan: z.string().nonempty()
})
  .pick({
    plan: true,
    source: true,
    deploymentId: true
  })
  .strict()

export const consumerUpdateSchema = createUpdateSchema(consumers, {
  deploymentId: (schema) =>
    schema
      .refine((id) => validators.deploymentId(id), {
        message: 'Invalid deployment id'
      })
      .optional()
})
  .pick({
    plan: true,
    deploymentId: true
  })
  .strict()
