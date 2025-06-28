import {
  agenticProjectConfigSchema,
  pricingIntervalSchema,
  type StripeMeterIdMap,
  stripeMeterIdMapSchema,
  type StripePriceIdMap,
  stripePriceIdMapSchema,
  type StripeProductIdMap,
  stripeProductIdMapSchema
} from '@agentic/platform-types'
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

import { env } from '@/lib/env'

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
  projectName,
  projectNamespace,
  projectPrimaryId,
  projectSlug,
  stripeId,
  teamId,
  timestamps,
  userId
} from './common'
import { deployments, deploymentSelectSchema } from './deployment'
import { teams, teamSelectSchema } from './team'
import { users, userSelectSchema } from './user'

/**
 * A Project represents a single Agentic API product. Is is comprised of a
 * series of immutable Deployments, each of which contains pricing data, origin
 * API config, OpenAPI or MCP specs, tool definitions, and various metadata.
 *
 * You can think of Agentic Projects as similar to Vercel projects. They both
 * hold some common configuration and are comprised of a series of immutable
 * Deployments.
 *
 * Internally, Projects manage all of the Stripe billing resources across
 * Deployments (Stripe Products, Prices, and Meters for usage-based billing).
 */
export const projects = pgTable(
  'projects',
  {
    ...projectPrimaryId,
    ...timestamps,

    // display name
    name: projectName().notNull(),

    // identifier is `@namespace/slug`
    identifier: projectIdentifier().unique().notNull(),

    // namespace is either a username or team slug
    namespace: projectNamespace().notNull(),

    // slug is a unique identifier for the project within its namespace
    slug: projectSlug().notNull(),

    // Defaulting to `true` for now to hide all projects from the marketplace
    // by default. Will need to manually set to `true` to allow projects to be
    // visible on the marketplace.
    private: boolean().default(true).notNull(),

    // TODO: allow for multiple aliases like vercel
    // alias: text(),

    userId: userId()
      .notNull()
      .references(() => users.id),
    teamId: teamId(),

    // Most recently published Deployment if one exists
    lastPublishedDeploymentId: deploymentId(),

    // Most recent Deployment if one exists
    lastDeploymentId: deploymentId(),

    // Semver version of the most recently published Deployment (if one exists)
    // (denormalized for convenience)
    lastPublishedDeploymentVersion: text(),

    applicationFeePercent: integer().default(20).notNull(),

    // TODO: This is going to need to vary from dev to prod
    //isStripeConnectEnabled: boolean().default(false).notNull(),

    // Default pricing interval for subscriptions to this project
    // Note: This is essentially hard-coded and not configurable by users for now.
    defaultPricingInterval: pricingIntervalEnum().default('month').notNull(),

    // Pricing currency used across all prices and subscriptions to this project
    pricingCurrency: pricingCurrencyEnum().default('usd').notNull(),

    // All deployments share the same underlying proxy secret, which allows
    // origin servers to verify that requests are coming from Agentic's API
    // gateway.
    _secret: text().notNull(),

    // Auth token used to access the platform API on behalf of this project
    // _providerToken: text().notNull(),

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
    index('project_namespace_idx').on(table.namespace),
    index('project_userId_idx').on(table.userId),
    index('project_teamId_idx').on(table.teamId),
    // index('project_alias_idx').on(table.alias),
    index('project_private_idx').on(table.private),
    index('project_lastPublishedDeploymentId_idx').on(
      table.lastPublishedDeploymentId
    ),
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

export const projectSelectBaseSchema = createSelectSchema(projects, {
  id: projectIdSchema,
  userId: userIdSchema,
  teamId: teamIdSchema.optional(),
  identifier: projectIdentifierSchema,
  name: agenticProjectConfigSchema.shape.name,
  slug: agenticProjectConfigSchema.shape.slug,
  lastPublishedDeploymentId: deploymentIdSchema.optional(),
  lastDeploymentId: deploymentIdSchema.optional(),

  applicationFeePercent: (schema) => schema.nonnegative(),

  defaultPricingInterval: pricingIntervalSchema,

  _stripeProductIdMap: stripeProductIdMapSchema,
  _stripePriceIdMap: stripePriceIdMapSchema,
  _stripeMeterIdMap: stripeMeterIdMapSchema
})
  .omit({
    applicationFeePercent: true,
    _secret: true,
    // _text: true,
    _stripeProductIdMap: true,
    _stripePriceIdMap: true,
    _stripeMeterIdMap: true,
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

    // TODO: Improve the self-referential typing here that `@hono/zod-openapi`
    // trips up on.
    lastPublishedDeployment: z
      .any()
      .refine(
        (deployment): boolean =>
          !deployment || deploymentSelectSchema.safeParse(deployment).success,
        {
          message: 'Invalid lastPublishedDeployment'
        }
      )
      .transform((deployment): any => {
        if (!deployment) return undefined

        return deploymentSelectSchema.parse(deployment)
      })
      .optional(),

    lastDeployment: z
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
      .optional(),

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

// These are all derived virtual URLs that are not stored in the database
export const derivedProjectFields = {
  /**
   * The public base HTTP URL for the project supporting HTTP POST requests for
   * individual tools at `/tool-name` subpaths.
   *
   * @example https://gateway.agentic.so/@agentic/search
   */
  gatewayBaseUrl: z
    .string()
    .url()
    .describe(
      'The public base HTTP URL for the project supporting HTTP POST requests for individual tools at `/tool-name` subpaths.'
    ),

  /**
   * The public MCP URL for the project supporting the Streamable HTTP transport.
   *
   * @example https://gateway.agentic.so/@agentic/search/mcp
   */
  gatewayMcpUrl: z
    .string()
    .url()
    .describe(
      'The public MCP URL for the project supporting the Streamable HTTP transport.'
    ),

  /**
   * The public marketplace URL for the project.
   *
   * @example https://agentic.so/marketplace/projects/@agentic/search
   */
  marketplaceUrl: z
    .string()
    .url()
    .describe('The public marketplace URL for the project.'),

  /**
   * A private admin URL for managing the project. This URL is only accessible
   * by project owners.
   *
   * @example https://agentic.so/app/projects/@agentic/search
   */
  adminUrl: z
    .string()
    .url()
    .describe(
      'A private admin URL for managing the project. This URL is only accessible by project owners.'
    )
} as const

export const projectSelectSchema = projectSelectBaseSchema
  .transform((project) => ({
    ...project,
    gatewayBaseUrl: `${env.AGENTIC_GATEWAY_BASE_URL}/${project.identifier}`,
    gatewayMcpUrl: `${env.AGENTIC_GATEWAY_BASE_URL}/${project.identifier}/mcp`,
    marketplaceUrl: `${env.AGENTIC_WEB_BASE_URL}/marketplace/projects/${project.identifier}`,
    adminUrl: `${env.AGENTIC_WEB_BASE_URL}/app/projects/${project.identifier}`
  }))
  .pipe(projectSelectBaseSchema.extend(derivedProjectFields).strip())
  .describe(
    `A Project represents a single Agentic API product. It is comprised of a series of immutable Deployments, each of which contains pricing data, origin API config, OpenAPI or MCP specs, tool definitions, and various metadata.

You can think of Agentic Projects as similar to Vercel projects. They both hold some common configuration and are comprised of a series of immutable Deployments.

Internally, Projects manage all of the Stripe billing resources across Deployments (Stripe Products, Prices, and Meters for usage-based billing).`
  )
  .openapi('Project')

export const projectInsertSchema = createInsertSchema(projects, {
  identifier: projectIdentifierSchema,

  name: agenticProjectConfigSchema.shape.name,
  slug: agenticProjectConfigSchema.shape.slug
})
  .pick({
    name: true,
    slug: true
  })
  .strict()

export const projectUpdateSchema = createUpdateSchema(projects)
  .pick({
    name: true
    // alias: true
  })
  .strict()

// TODO: virtual saasUrl
// TODO: virtual aliasUrl
