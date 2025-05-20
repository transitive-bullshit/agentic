import { validators } from '@agentic/platform-validators'
import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex
} from '@fisch0920/drizzle-orm/pg-core'
import { z } from '@hono/zod-openapi'

import {
  deploymentIdSchema,
  projectIdentifierSchema,
  projectIdSchema,
  teamIdSchema,
  userIdSchema
} from '../schemas'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  deploymentId,
  pricingCurrencyEnum,
  pricingIntervalEnum,
  projectIdentifier,
  projectPrimaryId,
  stripeId,
  teamId,
  timestamps,
  userId
} from './common'
import { deployments } from './deployment'
import {
  pricingIntervalSchema,
  type StripeMeterIdMap,
  stripeMeterIdMapSchema,
  type StripePriceIdMap,
  stripePriceIdMapSchema,
  type StripeProductIdMap,
  stripeProductIdMapSchema
} from './schemas'
import { teams } from './team'
import { users } from './user'

export const projects = pgTable(
  'projects',
  {
    ...projectPrimaryId,
    ...timestamps,

    identifier: projectIdentifier().unique().notNull(),
    name: text().notNull(),
    alias: text(),

    userId: userId()
      .notNull()
      .references(() => users.id),
    teamId: teamId(),

    // Most recently published Deployment if one exists
    lastPublishedDeploymentId: deploymentId(),

    // Most recent Deployment if one exists
    lastDeploymentId: deploymentId(),

    applicationFeePercent: integer().default(20).notNull(),

    // TODO: This is going to need to vary from dev to prod
    isStripeConnectEnabled: boolean().default(false).notNull(),

    // Which pricing intervals are supported for subscriptions to this project
    pricingIntervals: pricingIntervalEnum()
      .array()
      .default(['month'])
      .notNull(),

    // Default pricing interval for subscriptions to this project
    defaultPricingInterval: pricingIntervalEnum().default('month').notNull(),

    // Pricing currency used across all prices and subscriptions to this project
    pricingCurrency: pricingCurrencyEnum().default('usd').notNull(),

    // All deployments share the same underlying proxy secret
    _secret: text().notNull(),

    // Auth token used to access the platform API on behalf of this project
    _providerToken: text().notNull(),

    // TODO: Full-text search
    // _text: text().default('').notNull(),

    // Stripe coupons associated with this project, mapping from unique coupon
    // object hash to stripe coupon id.
    // `[hash: string]: string`
    // _stripeCouponsMap: jsonb()
    //   .$type<Record<string, string>>()
    //   .default({})
    //   .notNull(),

    // Stripe billing Products associated with this project across deployments,
    // mapping from PricingPlanLineItem **slug** to Stripe Product id.
    // NOTE: This map uses slugs as keys, unlike `_stripePriceIdMap`, because
    // Stripe Products are agnostic to the PricingPlanLineItem config. This is
    // important for them to be shared across deployments even if the pricing
    // details change.
    _stripeProductIdMap: jsonb()
      .$type<StripeProductIdMap>()
      .default({})
      .notNull(),

    // Stripe billing Prices associated with this project, mapping from unique
    // PricingPlanLineItem **hash** to Stripe Price id.
    // NOTE: This map uses hashes as keys, because Stripe Prices are dependent
    // on the PricingPlanLineItem config. This is important for them to be shared
    // across deployments even if the pricing details change.
    _stripePriceIdMap: jsonb().$type<StripePriceIdMap>().default({}).notNull(),

    // Stripe billing LineItems associated with this project, mapping from unique
    // PricingPlanLineItem **slug** to Stripe Meter id.
    // NOTE: This map uses slugs as keys, unlike `_stripePriceIdMap`, because
    // Stripe Products are agnostic to the PricingPlanLineItem config. This is
    // important for them to be shared across deployments even if the pricing
    // details change.
    _stripeMeterIdMap: jsonb().$type<StripeMeterIdMap>().default({}).notNull(),

    // Connected Stripe account (standard or express).
    // If not defined, then subscriptions for this project route through our
    // main Stripe account.
    _stripeAccountId: stripeId()
  },
  (table) => [
    uniqueIndex('project_identifier_idx').on(table.identifier),
    index('project_userId_idx').on(table.userId),
    index('project_teamId_idx').on(table.teamId),
    index('project_alias_idx').on(table.alias),
    index('project_createdAt_idx').on(table.createdAt),
    index('project_updatedAt_idx').on(table.updatedAt),
    index('project_deletedAt_idx').on(table.deletedAt)
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

export const projectSelectSchema = createSelectSchema(projects, {
  id: projectIdSchema,
  userId: userIdSchema,
  teamId: teamIdSchema.optional(),
  identifier: projectIdentifierSchema,
  lastPublishedDeploymentId: deploymentIdSchema.optional(),
  lastDeploymentId: deploymentIdSchema.optional(),

  applicationFeePercent: (schema) => schema.nonnegative(),

  pricingIntervals: z.array(pricingIntervalSchema).nonempty(),
  defaultPricingInterval: pricingIntervalSchema,

  _stripeProductIdMap: stripeProductIdMapSchema,
  _stripePriceIdMap: stripePriceIdMapSchema,
  _stripeMeterIdMap: stripeMeterIdMapSchema
})
  .omit({
    _secret: true,
    _providerToken: true,
    // _text: true,
    _stripeProductIdMap: true,
    _stripePriceIdMap: true,
    _stripeMeterIdMap: true,
    _stripeAccountId: true
  })
  // .extend({
  //   user: z
  //     .lazy(() => userSelectSchema)
  //     .optional()
  //     .openapi('User', { type: 'object' }),

  //   team: z
  //     .lazy(() => teamSelectSchema)
  //     .optional()
  //     .openapi('Team', { type: 'object' }),

  //   lastPublishedDeployment: z
  //     .lazy(() => deploymentSelectSchema)
  //     .optional()
  //     .openapi('Deployment', { type: 'object' }),

  //   lastDeployment: z
  //     .lazy(() => deploymentSelectSchema)
  //     .optional()
  //     .openapi('Deployment', { type: 'object' })
  // })
  .strip()
  .openapi('Project')

export const projectInsertSchema = createInsertSchema(projects, {
  identifier: projectIdentifierSchema,

  name: (schema) =>
    schema.refine((name) => validators.projectName(name), {
      message: 'Invalid project name'
    })
})
  .pick({
    name: true
  })
  .strict()

export const projectUpdateSchema = createUpdateSchema(projects)
  .pick({
    name: true,
    alias: true
  })
  .strict()

// TODO: virtual saasUrl
// TODO: virtual aliasUrl
