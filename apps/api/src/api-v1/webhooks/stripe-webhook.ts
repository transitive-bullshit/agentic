import type { OpenAPIHono } from '@hono/zod-openapi'
import type Stripe from 'stripe'
import { assert, HttpError } from '@agentic/platform-core'

import { and, db, eq, schema } from '@/db'
import { setConsumerStripeSubscriptionStatus } from '@/lib/consumers/utils'
import { env } from '@/lib/env'
import { stripe } from '@/lib/external/stripe'

const relevantStripeEvents = new Set<Stripe.Event.Type>([
  'customer.subscription.updated'
])

export function registerV1StripeWebhook(app: OpenAPIHono) {
  return app.post('webhooks/stripe', async (ctx) => {
    const body = await ctx.req.text()
    const signature = ctx.req.header('Stripe-Signature')
    assert(signature, 400, 'missing signature')

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      throw new HttpError({
        message: 'invalid stripe event',
        cause: err,
        statusCode: 400
      })
    }

    // Shouldn't ever happen because the signatures _should_ be different, but
    // it's a useful sanity check just in case.
    assert(
      event.livemode === env.isStripeLive,
      400,
      'invalid stripe event: livemode mismatch'
    )

    if (!relevantStripeEvents.has(event.type)) {
      // TODO
      return ctx.json({ status: 'ok' })
    }

    try {
      switch (event.type) {
        case 'customer.subscription.updated': {
          // https://docs.stripe.com/billing/subscriptions/overview#subscription-statuses
          const subscription = event.data.object
          const { userId, projectId } = subscription.metadata
          assert(userId, 400, 'missing metadata userId')
          assert(projectId, 400, 'missing metadata projectId')

          // logger.info(event.type, {
          //   userId,
          //   projectId,
          //   status: subscription.status
          // })

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
