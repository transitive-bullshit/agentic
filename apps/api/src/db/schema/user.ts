import { validators } from '@agentic/validators'
import { z } from '@hono/zod-openapi'
import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
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
  optionalStripeId,
  optionalText,
  optionalTimestamp,
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

    email: optionalText().unique(),
    password: optionalText(),

    // metadata
    firstName: optionalText(),
    lastName: optionalText(),
    image: optionalText(),

    emailConfirmed: boolean().default(false).notNull(),
    emailConfirmedAt: optionalTimestamp(),
    emailConfirmToken: text().unique().default(sha256()).notNull(),
    passwordResetToken: optionalText().unique(),

    isStripeConnectEnabledByDefault: boolean().default(true).notNull(),

    // third-party auth providers
    providers: jsonb().$type<AuthProviders>().default({}).notNull(),

    stripeCustomerId: optionalStripeId().unique()
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
  email: z.string().email().optional(),
  password: z.string().nonempty().optional(),

  firstName: z.string().optional(),
  lastName: z.string().optional(),
  image: z.string().nonempty().optional(),

  emailConfirmedAt: z.string().datetime().optional(),
  passwordResetToken: z.string().nonempty().optional(),

  providers: authProvidersSchema,

  stripeCustomerId: z.string().nonempty().optional()
}).openapi('User')

export const userUpdateSchema = createUpdateSchema(users)
