import { relations } from '@fisch0920/drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex
} from '@fisch0920/drizzle-orm/pg-core'

import {
  createSelectSchema,
  stripeId,
  timestamps,
  username,
  // username,
  userPrimaryId,
  userRoleEnum
} from './common'
import { teams } from './team'

// This table is mostly managed by better-auth.

export const users = pgTable(
  'users',
  {
    ...userPrimaryId,
    ...timestamps,

    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').default(false).notNull(),
    image: text('image'),

    // TODO: re-add username
    username: username(),
    role: userRoleEnum().default('user').notNull(),

    isStripeConnectEnabledByDefault: boolean().default(true).notNull(),

    stripeCustomerId: stripeId()
  },
  (table) => [
    uniqueIndex('user_email_idx').on(table.email),
    // uniqueIndex('user_username_idx').on(table.username),
    index('user_createdAt_idx').on(table.createdAt),
    index('user_updatedAt_idx').on(table.updatedAt),
    index('user_deletedAt_idx').on(table.deletedAt)
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  teamsOwned: many(teams)
}))

export const userSelectSchema = createSelectSchema(users, {
  // authProviders: publicAuthProvidersSchema
})
  // .omit({ password: true, emailConfirmToken: true, passwordResetToken: true })
  .strip()
  .openapi('User')

// export const userInsertSchema = createInsertSchema(users, {
//   username: (schema) =>
//     schema.refine((username) => validators.username(username), {
//       message: 'Invalid username'
//     }),

//   email: (schema) => schema.email().optional()
// })
//   .pick({
//     username: true,
//     email: true,
//     password: true,
//     firstName: true,
//     lastName: true,
//     image: true
//   })
//   .strict()
//   .transform((user) => {
//     return {
//       ...user,
//       emailConfirmToken: sha256(),
//       password: user.password ? hashSync(user.password) : undefined
//     }
//   })

// export const userUpdateSchema = createUpdateSchema(users)
//   .pick({
//     firstName: true,
//     lastName: true,
//     image: true,
//     password: true,
//     isStripeConnectEnabledByDefault: true
//   })
//   .strict()
//   .transform((user) => {
//     return {
//       ...user,
//       password: user.password ? hashSync(user.password) : undefined
//     }
//   })
