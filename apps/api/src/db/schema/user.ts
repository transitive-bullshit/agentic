import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex
} from '@fisch0920/drizzle-orm/pg-core'

import {
  authTimestamps,
  createSelectSchema,
  createUpdateSchema,
  stripeId,
  username,
  // username,
  userPrimaryId,
  userRoleEnum
} from './common'

// This table is mostly managed by better-auth.

export const users = pgTable(
  'users',
  {
    ...userPrimaryId,
    ...authTimestamps,

    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().default(false).notNull(),
    image: text(),

    // TODO: re-add username
    username: username().unique(),
    role: userRoleEnum().default('user').notNull(),

    isStripeConnectEnabledByDefault: boolean().default(true).notNull(),

    stripeCustomerId: stripeId()
  },
  (table) => [
    uniqueIndex('user_email_idx').on(table.email),
    uniqueIndex('user_username_idx').on(table.username),
    index('user_createdAt_idx').on(table.createdAt),
    index('user_updatedAt_idx').on(table.updatedAt)
    // index('user_deletedAt_idx').on(table.deletedAt)
  ]
)

export const userSelectSchema = createSelectSchema(users)
  .strip()
  .openapi('User')

export const userUpdateSchema = createUpdateSchema(users)
  .pick({
    name: true,
    image: true,
    isStripeConnectEnabledByDefault: true
  })
  .strict()
