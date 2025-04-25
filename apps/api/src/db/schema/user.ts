import { validators } from '@agentic/validators'
import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'

import { sha256 } from '@/lib/utils'

import { teams } from './team'
import { type AuthProviders, authProvidersSchema } from './types'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  id,
  stripeId,
  timestamps,
  userRoleEnum
} from './utils'

export const users = pgTable(
  'users',
  {
    id,
    ...timestamps,

    username: text().notNull().unique(),
    role: userRoleEnum().default('user').notNull(),

    email: text().unique(),
    password: text(),

    // metadata
    firstName: text(),
    lastName: text(),
    image: text(),

    emailConfirmed: boolean().default(false),
    emailConfirmedAt: timestamp({ mode: 'string' }),
    emailConfirmToken: text().unique().default(sha256()),
    passwordResetToken: text().unique(),

    isStripeConnectEnabledByDefault: boolean().default(true),

    // third-party auth providers
    providers: jsonb().$type<AuthProviders>().default({}),

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

export const userInsertSchema = createInsertSchema(users, {
  username: (schema) =>
    schema.refine((username) => validators.username(username), {
      message: 'Invalid username'
    }),

  email: (schema) =>
    schema.refine(
      (email) => {
        if (email) {
          return validators.email(email)
        }

        return true
      },
      {
        message: 'Invalid email'
      }
    ),

  providers: authProvidersSchema.optional()
}).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  image: true
})

export const userSelectSchema = createSelectSchema(users, {
  providers: authProvidersSchema
}).openapi('User')

export const userUpdateSchema = createUpdateSchema(users)
