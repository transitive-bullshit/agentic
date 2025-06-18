import type Stripe from 'stripe'
import { assert, HttpError } from '@agentic/platform-core'

import type { HonoApp } from '@/lib/types'
import { and, db, eq, schema } from '@/db'
import { setConsumerStripeSubscriptionStatus } from '@/lib/consumers/utils'
import { env } from '@/lib/env'
import { stripe } from '@/lib/external/stripe'

const relevantStripeEvents = new Set<Stripe.Event.Type>([
  'checkout.session.completed',
  'checkout.session.expired',
  'checkout.session.async_payment_failed',
  'checkout.session.async_payment_succeeded',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'customer.subscription.deleted',
  'customer.subscription.pending_update_applied',
  'customer.subscription.pending_update_expired',
  'customer.subscription.trial_will_end'
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
        case 'customer.subscription.updated': {
          // https://docs.stripe.com/billing/subscriptions/overview#subscription-statuses
          const subscription = event.data.object
          const { userId, projectId } = subscription.metadata
          assert(userId, 400, 'missing metadata userId')
          assert(projectId, 400, 'missing metadata projectId')

          logger.info('stripe webhook', event.type, {
            userId,
            projectId,
            status: subscription.status
          })

          const consumer = await db.query.consumers.findFirst({
            where: and(
              eq(schema.consumers.userId, userId),
              eq(schema.consumers.projectId, projectId)
            ),
            with: {
              user: true,
              project: true
            }
          })
          assert(consumer, 404, 'consumer not found')

          if (consumer.stripeStatus !== subscription.status) {
            consumer.stripeStatus = subscription.status
            setConsumerStripeSubscriptionStatus(consumer)

            // TODO: update plan
            await db
              .update(schema.consumers)
              .set({
                stripeStatus: consumer.stripeStatus,
                isStripeSubscriptionActive: consumer.isStripeSubscriptionActive
              })
              .where(eq(schema.consumers.id, consumer.id))

            // TODO: invoke provider webhooks
            // event.data.customer = consumer.getPublicDocument()
            // await invokeWebhooks(consumer.project, event)
          }

          break
        }

        default:
          throw new Error(`unexpected unhandled event "${event.type}"`)
      }
    } catch (err) {
      throw new HttpError({
        message: `error processing stripe webhook type "${event.type}"`,
        cause: err,
        statusCode: 500
      })
    }

    return ctx.json({ status: 'ok' })
  })
}
