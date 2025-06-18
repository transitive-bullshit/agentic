import type Stripe from 'stripe'
import { assert, HttpError } from '@agentic/platform-core'

import type { HonoApp } from '@/lib/types'
import { and, db, eq, type RawConsumer, schema } from '@/db'
import { setConsumerStripeSubscriptionStatus } from '@/lib/consumers/utils'
import { env } from '@/lib/env'
import { stripe } from '@/lib/external/stripe'

const relevantStripeEvents = new Set<Stripe.Event.Type>([
  // Stripe Checkout Sessions
  'checkout.session.completed',

  // TODO: Handle these events
  // 'checkout.session.expired',
  // 'checkout.session.async_payment_failed',
  // 'checkout.session.async_payment_succeeded',

  // Stripe Subscriptions
  'customer.subscription.created',

  // TODO: Test these events which should be able to all use the same code path
  'customer.subscription.updated',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'customer.subscription.deleted'

  // TODO: Handle these events
  // 'customer.subscription.pending_update_applied',
  // 'customer.subscription.pending_update_expired',
  // 'customer.subscription.trial_will_end'
])

export function registerV1StripeWebhook(app: HonoApp) {
  return app.post('webhooks/stripe', async (ctx) => {
    const logger = ctx.get('logger')
    const body = await ctx.req.text()
    const signature = ctx.req.header('Stripe-Signature')
    assert(
      signature,
      400,
      'error invalid stripe webhook event: missing signature'
    )

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      throw new HttpError({
        message: 'error invalid stripe webhook event: signature mismatch',
        cause: err,
        statusCode: 400
      })
    }

    // Shouldn't ever happen because the signatures _should_ be different, but
    // it's a useful sanity check just in case.
    assert(
      event.livemode === env.isStripeLive,
      400,
      'error invalid stripe webhook event: livemode mismatch'
    )

    if (!relevantStripeEvents.has(event.type)) {
      return ctx.json({ status: 'ok' })
    }

    logger.info('stripe webhook', event.type, event.data?.object)

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object
          const { subscription: subscriptionOrId } = checkoutSession
          assert(subscriptionOrId, 400, 'missing subscription')
          const { consumerId, plan, userId, projectId, deploymentId } =
            checkoutSession.metadata ?? {}
          assert(consumerId, 400, 'missing metadata.consumerId')
          assert(plan !== undefined, 400, 'missing metadata.plan')

          const subscriptionId =
            typeof subscriptionOrId === 'string'
              ? subscriptionOrId
              : subscriptionOrId.id

          const [subscription, consumer] = await Promise.all([
            // Make sure we have the full subscription instead of just the id
            typeof subscriptionOrId === 'string'
              ? stripe.subscriptions.retrieve(subscriptionId)
              : subscriptionOrId,

            db.query.consumers.findFirst({
              where: and(eq(schema.consumers.id, consumerId))
            })
          ])
          assert(
            subscription,
            404,
            `stripe subscription "${subscriptionId}" not found`
          )
          assert(consumer, 404, `consumer "${consumerId}" not found`)

          // TODO: Treat this as a transaction...
          await Promise.all([
            // Ensure the underlying Stripe Subscription has all the necessary
            // metadata
            stripe.subscriptions.update(subscription.id, {
              metadata: {
                ...subscription.metadata,
                ...checkoutSession.metadata
              }
            }),

            // Sync our Consumer's state with the Stripe Subscription's state
            syncConsumerWithStripeSubscription({
              consumer,
              subscription,
              plan,
              userId,
              projectId,
              deploymentId
            })
          ])
          break
        }

        case 'customer.subscription.created': {
          // Stripe Checkout-created subscriptions won't have the metadata
          // necessary to identify the consumer, so ignore this event for now.
          const subscription = event.data.object
          const { consumerId, userId, projectId, deploymentId, plan } =
            subscription.metadata

          // TODO: This should be coming from Stripe Checkout, and a very flow
          // follow-up webhook event should record the subscription and
          // initialize the consumer, but it feels wrong to me to just be
          // logging and ignore this event. In the future, if we support both
          // Stripe Checkout and non-Stripe Checkout-based subscription flows,
          // then this codepath should act very similarly to
          // `customer.subscription.updated`.
          if (
            !consumerId ||
            !userId ||
            !projectId ||
            !deploymentId ||
            plan === undefined
          ) {
            break
          }

          // Intentional fallthrough
        }

        case 'customer.subscription.paused':
        case 'customer.subscription.resumed':
        case 'customer.subscription.deleted':
        case 'customer.subscription.updated': {
          // https://docs.stripe.com/billing/subscriptions/overview#subscription-statuses
          const subscription = event.data.object
          const { consumerId, userId, projectId, deploymentId, plan } =
            subscription.metadata
          assert(consumerId, 'missing metadata.consumerId')
          assert(plan !== undefined, 400, 'missing metadata.plan')

          logger.info('stripe webhook', event.type, {
            consumerId,
            userId,
            projectId,
            deploymentId,
            plan,
            status: subscription.status
          })

          const consumer = await db.query.consumers.findFirst({
            where: eq(schema.consumers.id, consumerId)
          })
          assert(consumer, 404, `consumer "${consumerId}" not found`)

          // Sync our Consumer's state with the Stripe Subscription's state
          await syncConsumerWithStripeSubscription({
            consumer,
            subscription,
            plan,
            userId,
            projectId,
            deploymentId
          })
          break
        }

        default:
          logger.warn(
            `unexpected unhandled event "${event.id}" type "${event.type}"`,
            event.data?.object
          )
      }
    } catch (err: any) {
      throw new HttpError({
        message: `error processing stripe webhook event "${event.id}" type "${event.type}": ${err.message}`,
        cause: err.cause ?? err,
        statusCode: err.statusCode ?? err
      })
    }

    return ctx.json({ status: 'ok' })
  })
}

/**
 * Sync our database Consumer's state with the Stripe Subscription's state.
 *
 * For anything billing-related, Stripe's resources is always considered the
 * single source of truth. Our database's `Consumer` state should always be
 * derived from the corresponding Stripe subscription.
 */
export async function syncConsumerWithStripeSubscription({
  consumer,
  subscription,
  plan,
  userId,
  projectId,
  deploymentId
}: {
  consumer: RawConsumer
  subscription: Stripe.Subscription
  plan: string | null | undefined
  userId?: string
  projectId?: string
  deploymentId?: string
}) {
  // These extra checks aren't really necessary, but they're nice sanity checks
  // to ensure metadata consistency with our consumer
  assert(
    consumer.userId === userId,
    400,
    `consumer "${consumer.id}" user "${consumer.userId}" does not match stripe checkout metadata user "${userId}"`
  )
  assert(
    consumer.projectId === projectId,
    400,
    `consumer "${consumer.id}" project "${consumer.projectId}" does not match stripe checkout metadata project "${projectId}"`
  )

  if (
    consumer._stripeSubscriptionId !== subscription.id ||
    consumer.stripeStatus !== subscription.status ||
    consumer.plan !== plan ||
    consumer.deploymentId !== deploymentId
  ) {
    consumer._stripeSubscriptionId = subscription.id
    consumer.stripeStatus = subscription.status
    setConsumerStripeSubscriptionStatus(consumer)

    if (deploymentId) {
      consumer.deploymentId = deploymentId
    }

    await db
      .update(schema.consumers)
      .set(consumer)
      .where(eq(schema.consumers.id, consumer.id))

    // TODO: invoke provider webhooks
    // event.data.customer = consumer.getPublicDocument()
    // await invokeWebhooks(consumer.project, event)
  }
}
