import { validators } from '@agentic/validators'
import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex
} from '@fisch0920/drizzle-orm/pg-core'
import { hashSync } from 'bcryptjs'

import { sha256 } from '@/lib/utils'

import { teams } from './team'
import { type AuthProviders, authProvidersSchema } from './types'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  id,
  stripeId,
  timestamp,
  timestamps,
  username,
  userRoleEnum
} from './utils'

export const users = pgTable(
  'users',
  {
    id,
    ...timestamps,

    username: username().notNull().unique(),
    role: userRoleEnum().default('user').notNull(),

    email: text().unique(),
    password: text(),

    // metadata
    firstName: text(),
    lastName: text(),
    image: text(),

    emailConfirmed: boolean().default(false).notNull(),
    emailConfirmedAt: timestamp(),
    emailConfirmToken: text().unique().notNull(),
    passwordResetToken: text().unique(),

    isStripeConnectEnabledByDefault: boolean().default(true).notNull(),

    // third-party auth providers
    providers: jsonb().$type<AuthProviders>().default({}).notNull(),

    stripeCustomerId: stripeId().unique()
  },
  (table) => [
    uniqueIndex('user_email_idx').on(table.email),
    uniqueIndex('user_username_idx').on(table.username),
    uniqueIndex('user_emailConfirmToken_idx').on(table.emailConfirmToken),
    uniqueIndex('user_passwordResetToken_idx').on(table.passwordResetToken),
    index('user_createdAt_idx').on(table.createdAt),
    index('user_updatedAt_idx').on(table.updatedAt)
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  teamsOwned: many(teams)
}))

export const userSelectSchema = createSelectSchema(users).openapi('User')

export const userInsertSchema = createInsertSchema(users, {
  username: (schema) =>
    schema.refine((username) => validators.username(username), {
      message: 'Invalid username'
    }),

  email: (schema) => schema.email().optional(),

  providers: authProvidersSchema.optional()
})
  .pick({
    username: true,
    email: true,
    password: true,
    firstName: true,
    lastName: true,
    image: true
  })
  .strict()
  .refine((user) => {
    return {
      ...user,
      emailConfirmToken: sha256(),
      password: user.password ? hashSync(user.password) : undefined
    }
  })

export const userUpdateSchema = createUpdateSchema(users)
  .pick({
    firstName: true,
    lastName: true,
    image: true,
    password: true,
    isStripeConnectEnabledByDefault: true
  })
  .strict()
  .refine((user) => {
    return {
      ...user,
      password: user.password ? hashSync(user.password) : undefined
    }
  })
