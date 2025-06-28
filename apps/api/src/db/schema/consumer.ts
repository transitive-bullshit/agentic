import { parseZodSchema } from '@agentic/platform-core'
import {
  type StripeSubscriptionItemIdMap,
  stripeSubscriptionItemIdMapSchema
} from '@agentic/platform-types'
import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text
} from '@fisch0920/drizzle-orm/pg-core'
import { z } from '@hono/zod-openapi'

import { env } from '@/lib/env'

import type { Consumer } from '../types'
import {
  consumerIdSchema,
  deploymentIdSchema,
  projectIdSchema,
  userIdSchema
} from '../schemas'
import {
  consumerPrimaryId,
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  deploymentId,
  projectId,
  stripeId,
  timestamps,
  userId
} from './common'
import { deployments, deploymentSelectSchema } from './deployment'
import { projects, projectSelectSchema } from './project'
import { users, userSelectSchema } from './user'

// TODO: Consumers should be valid for any enabled project like in RapidAPI and GCP.
// This may require a separate model to aggregate User Applications.
// https://docs.rapidapi.com/docs/keys#section-different-api-keys-per-application

/**
 * A `Consumer` represents a user who has subscribed to a `Project` and is used
 * to track usage and billing.
 *
 * Consumers are linked to a corresponding Stripe Customer and Subscription.
 * The Stripe customer will either be the user's default Stripe Customer if the
 * project uses the default Agentic platform account, or a customer on the project
 * owner's connected Stripe account if the project has Stripe Connect enabled.
 */
export const consumers = pgTable(
  'consumers',
  {
    ...consumerPrimaryId,
    ...timestamps,

    // API token for this consumer
    token: text().notNull(),

    // The slug of the PricingPlan in the target deployment that this consumer
    // is subscribed to.
    plan: text(),

    // Whether the consumer has made at least one successful API call after
    // initializing their subscription.
    activated: boolean().default(false).notNull(),

    // TODO: Re-add coupon support
    // coupon: text(),

    // only used during initial creation
    source: text(),

    userId: userId()
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

    // Stripe subscription status (synced via webhooks). Should move from
    // `incomplete` to `active` after the first successful payment.
    stripeStatus: text().default('incomplete').notNull(),

    // Whether the consumer's subscription is currently active, depending on
    // `stripeStatus`.
    isStripeSubscriptionActive: boolean().default(true).notNull(),

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
    index('consumer_isStripeSubscriptionActive_idx').on(
      table.isStripeSubscriptionActive
    ),
    index('consumer_createdAt_idx').on(table.createdAt),
    index('consumer_updatedAt_idx').on(table.updatedAt),
    index('consumer_deletedAt_idx').on(table.deletedAt)
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
  id: consumerIdSchema,
  userId: userIdSchema,
  projectId: projectIdSchema,
  deploymentId: deploymentIdSchema,

  _stripeSubscriptionItemIdMap: stripeSubscriptionItemIdMapSchema
})
  .omit({
    _stripeSubscriptionId: true,
    _stripeSubscriptionItemIdMap: true,
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

    // deployment: z
    //   .lazy(() => deploymentSelectSchema)
    //   .optional()
    //   .openapi('Deployment', { type: 'object' })

    // TODO: Improve the self-referential typing here that `@hono/zod-openapi`
    // trips up on.
    deployment: z
      .any()
      .refine(
        (deployment): boolean =>
          !deployment || deploymentSelectSchema.safeParse(deployment).success,
        {
          message: 'Invalid lastDeployment'
        }
      )
      .transform((deployment): any => {
        if (!deployment) return undefined
        return deploymentSelectSchema.parse(deployment)
      })
      .optional()
  })
  .strip()
  // These are all derived virtual URLs that are not stored in the database
  .extend({
    /**
     * A private admin URL for managing the customer's subscription. This URL
     * is only accessible by the customer.
     *
     * @example https://agentic.so/app/consumers/cons_123
     */
    adminUrl: z
      .string()
      .url()
      .describe(
        "A private admin URL for managing the customer's subscription. This URL is only accessible by the customer."
      )
  })
  .describe(
    `A Consumer represents a user who has subscribed to a Project and is used
to track usage and billing.

Consumers are linked to a corresponding Stripe Customer and Subscription.
The Stripe customer will either be the user's default Stripe Customer if the
project uses the default Agentic platform account, or a customer on the project
owner's connected Stripe account if the project has Stripe Connect enabled.`
  )
  .openapi('Consumer')

export function parseConsumerSelectSchema(
  consumer: Record<string, any>
): Consumer {
  return parseZodSchema(consumerSelectSchema, {
    ...consumer,
    adminUrl: `${env.AGENTIC_WEB_BASE_URL}/app/consumers/${consumer.id}`
  })
}

export function parseConsumerSelectArraySchema(
  consumers: Record<string, any>[]
): Consumer[] {
  return consumers.map(parseConsumerSelectSchema)
}

export const consumerAdminSelectSchema = consumerSelectSchema
  .extend({
    _stripeCustomerId: z.string().nonempty()
  })
  .openapi('AdminConsumer')

export function parseConsumerAdminSelectSchema(
  consumer: Record<string, any>
): Consumer {
  return parseZodSchema(consumerAdminSelectSchema, {
    ...parseConsumerSelectSchema(consumer),
    ...consumer
  })
}

export const consumerInsertSchema = createInsertSchema(consumers, {
  deploymentId: deploymentIdSchema.optional(),

  plan: z.string().nonempty()
})
  .pick({
    plan: true,
    source: true,
    deploymentId: true
  })
  .strict()

export const consumerUpdateSchema = createUpdateSchema(consumers, {
  deploymentId: deploymentIdSchema.optional()
})
  .pick({
    plan: true,
    deploymentId: true
  })
  .strict()
