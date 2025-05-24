import type Stripe from 'stripe'
import { assert } from '@agentic/platform-core'

import { db, eq, type RawConsumer, type RawProject, schema } from '@/db'
import { stripe } from '@/lib/external/stripe'

// TODO: Update this for the new / updated Stripe Connect API

export async function upsertStripeConnectCustomer({
  stripeCustomer,
  consumer,
  project
}: {
  stripeCustomer: Stripe.Customer
  consumer: RawConsumer
  project: RawProject
}): Promise<Stripe.Customer | undefined> {
  if (!project._stripeAccountId) {
    return stripeCustomer
  }

  const stripeConnectParams = project._stripeAccountId
    ? [
        {
          stripeAccount: project._stripeAccountId
        }
      ]
    : []

  const stripeConnectCustomer = consumer._stripeCustomerId
    ? await stripe.customers.retrieve(
        consumer._stripeCustomerId,
        ...stripeConnectParams
      )
    : await stripe.customers.create(
        {
          email: stripeCustomer.email!,
          metadata: stripeCustomer.metadata
        },
        ...stripeConnectParams
      )
  assert(
    stripeConnectCustomer,
    500,
    `Failed to create stripe connect customer for user "${consumer.userId}"`
  )
  assert(
    !stripeConnectCustomer.deleted,
    500,
    `Stripe connect customer "${stripeConnectCustomer.id}" has been deleted`
  )

  if (consumer._stripeCustomerId !== stripeConnectCustomer.id) {
    consumer._stripeCustomerId = stripeConnectCustomer.id

    await db
      .update(schema.consumers)
      .set({ _stripeCustomerId: stripeConnectCustomer.id })
      .where(eq(schema.consumers.id, consumer.id))
  }

  // TODO: Ensure stripe connect default "source" exists and is cloned from
  // platform stripe account.

  return stripeConnectCustomer
}
