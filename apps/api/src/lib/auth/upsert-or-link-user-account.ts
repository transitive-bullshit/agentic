import type { SetRequired, Simplify } from 'type-fest'
import { assert } from '@agentic/platform-core'

import { and, db, eq, type RawAccount, type RawUser, schema } from '@/db'

import { getUniqueNamespace } from '../ensure-unique-namespace'

/**
 * After a user completes an authentication flow, we'll have partial account info
 * and partial suer info. This function takes these partial values and maps them
 * to a valid database Account and User.
 *
 * This will result in the Account being upserted, and may result in a new User
 * being created.
 */
export async function upsertOrLinkUserAccount({
  partialAccount,
  partialUser
}: {
  partialAccount: Simplify<
    SetRequired<
      Partial<
        Pick<
          RawAccount,
          | 'provider'
          | 'accountId'
          | 'accountUsername'
          | 'accessToken'
          | 'refreshToken'
          | 'accessTokenExpiresAt'
          | 'refreshTokenExpiresAt'
          | 'scope'
        >
      >,
      'provider' | 'accountId'
    >
  >
  partialUser: Simplify<
    SetRequired<
      Partial<
        Pick<RawUser, 'email' | 'name' | 'username' | 'image' | 'emailVerified'>
      >,
      'email'
    >
  >
}): Promise<RawUser> {
  const { provider, accountId } = partialAccount

  const [existingAccount, existingUser] = await Promise.all([
    db.query.accounts.findFirst({
      where: and(
        eq(schema.accounts.provider, provider),
        eq(schema.accounts.accountId, accountId)
      ),
      with: {
        user: true
      }
    }),

    db.query.users.findFirst({
      where: eq(schema.users.email, partialUser.email)
    })
  ])

  if (existingAccount && existingUser) {
    // Happy path case: the user is just logging in with an existing account
    // that's already linked to a user.
    assert(
      existingAccount.userId === existingUser.id,
      `Error authenticating with ${provider}: Account id "${existingAccount.id}" user id "${existingAccount.userId}" does not match expected user id "${existingUser.id}"`
    )

    // Udate the account with the up-to-date provider data, including any OAuth
    // tokens.
    await db
      .update(schema.accounts)
      .set(partialAccount)
      .where(eq(schema.accounts.id, existingAccount.id))

    return existingUser
  } else if (existingUser && !existingAccount) {
    // Linking a new account to an existing user
    await db.insert(schema.accounts).values({
      ...partialAccount,
      userId: existingUser.id
    })

    // TODO: Same caveat as below: if the existing user has a different email than
    // the one in the account we're linking, we should throw an error unless it's
    // a "trusted" provider.
    if (provider === 'password' && existingUser.email !== partialUser.email) {
      await db
        .update(schema.users)
        .set(partialUser)
        .where(eq(schema.users.id, existingUser.id))
    }

    return existingUser
  } else if (existingAccount && !existingUser) {
    assert(
      existingAccount.user,
      404,
      `Error authenticating with ${provider}: Account id "${existingAccount.id}" is linked to a user with a different email address than their ${provider} account, but the linked account user id "${existingAccount.userId}" is not found.`
    )

    // Existing account is linked to a user with a different email address than
    // this provider account. This should be fine since it's pretty common for
    // users to have multiple email addresses, but we may want to limit the
    // ability to automatically link accounts like this in the future to only
    // certain, trusted providers like `better-auth` does.
    return existingAccount.user
  } else {
    const username = await getUniqueNamespace(
      partialUser.username || partialUser.email.split('@')[0]!.toLowerCase(),
      { label: 'Username' }
    )

    // This is a user's first time signing up with the platform, so create both
    // a new user and linked account.
    return db.transaction(async (tx) => {
      // Create a new user
      const [user] = await tx
        .insert(schema.users)
        .values({
          ...partialUser,
          username
        })
        .returning()
      assert(
        user,
        500,
        `Error creating new user during ${provider} authentication`
      )

      // Create a new account linked to the new user
      await tx.insert(schema.accounts).values({
        ...partialAccount,
        userId: user.id
      })

      return user
    })
  }
}
