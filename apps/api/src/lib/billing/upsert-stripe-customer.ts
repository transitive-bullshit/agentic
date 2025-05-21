import type Stripe from 'stripe'
import { assert } from '@agentic/platform-core'

import type { AuthenticatedContext } from '@/lib/types'
import { db, eq, type RawUser, schema } from '@/db'
import { ensureAuthUser } from '@/lib/ensure-auth-user'
import { stripe } from '@/lib/stripe'

export async function upsertStripeCustomer(ctx: AuthenticatedContext): Promise<{
  user: RawUser
  stripeCustomer: Stripe.Customer
}> {
  const user = await ensureAuthUser(ctx)

  if (user.stripeCustomerId) {
    const stripeCustomer = await stripe.customers.retrieve(
      user.stripeCustomerId
    )
    assert(
      stripeCustomer,
      404,
      `Stripe customer "${user.stripeCustomerId}" not found for user "${user.id}"`
    )

    // TODO: handle this edge case
    assert(
      !stripeCustomer.deleted,
      404,
      `Stripe customer "${user.stripeCustomerId}" is deleted for user "${user.id}"`
    )

    return {
      user,
      stripeCustomer
    }
  }

  // TODO: add more metadata referencing signup LogEntry
  const metadata = {
    userId: user.id,
    email: user.email,
    username: user.username ?? null
  }

  const stripeCustomer = await stripe.customers.create({
    email: user.email,
    metadata
  })
  assert(
    stripeCustomer,
    500,
    `Failed to create stripe customer for user "${user.id}"`
  )

  user.stripeCustomerId = stripeCustomer.id
  await db
    .update(schema.users)
    .set({ stripeCustomerId: stripeCustomer.id })
    .where(eq(schema.users.id, user.id))

  return {
    user,
    stripeCustomer
  }
}
