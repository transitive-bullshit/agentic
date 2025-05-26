import type Stripe from 'stripe'
import { assert } from '@agentic/platform-core'

import type { AuthenticatedContext } from '@/lib/types'
import {
  db,
  eq,
  getStripePriceIdForPricingPlanLineItem,
  type RawConsumer,
  type RawConsumerUpdate,
  type RawDeployment,
  type RawProject,
  type RawUser,
  schema
} from '@/db'
import { stripe } from '@/lib/external/stripe'

import { setConsumerStripeSubscriptionStatus } from '../consumers/utils'

export async function upsertStripeSubscription(
  ctx: AuthenticatedContext,
  {
    consumer,
    user,
    deployment,
    project
  }: {
    consumer: RawConsumer
    user: RawUser
    deployment: RawDeployment
    project: RawProject
  }
): Promise<{
  subscription: Stripe.Subscription
  consumer: RawConsumer
}> {
  const logger = ctx.get('logger')
  const stripeConnectParams = project._stripeAccountId
    ? [
        {
          stripeAccount: project._stripeAccountId
        }
      ]
    : []

  const stripeCustomerId = consumer._stripeCustomerId || user.stripeCustomerId
  assert(
    stripeCustomerId,
    500,
    `Missing valid stripe customer. Please contact support for deployment "${deployment.id}" and consumer "${consumer.id}"`
  )

  const { plan } = consumer
  const pricingPlan = plan
    ? deployment.pricingPlans.find((pricingPlan) => pricingPlan.slug === plan)
    : undefined

  const action: 'create' | 'update' | 'cancel' = consumer._stripeSubscriptionId
    ? plan
      ? 'update'
      : 'cancel'
    : 'create'
  let subscription: Stripe.Subscription | undefined

  if (consumer._stripeSubscriptionId) {
    // customer has an existing subscription
    const existingStripeSubscription = await stripe.subscriptions.retrieve(
      consumer._stripeSubscriptionId,
      ...stripeConnectParams
    )
    const existingStripeSubscriptionItems =
      existingStripeSubscription.items.data
    logger.debug()
    logger.debug(
      'existing stripe subscription',
      JSON.stringify(existingStripeSubscription, null, 2)
    )
    logger.debug()

    assert(
      existingStripeSubscription.metadata?.userId === consumer.userId,
      500,
      `Error updating stripe subscription: invalid existing subscription "${existingStripeSubscription.id}" metadata.userId for consumer "${consumer.id}"`
    )
    assert(
      existingStripeSubscription.metadata?.consumerId === consumer.id,
      500,
      `Error updating stripe subscription: invalid existing subscription "${existingStripeSubscription.id}" metadata.consumerId for consumer "${consumer.id}"`
    )
    assert(
      existingStripeSubscription.metadata?.projectId === project.id,
      500,
      `Error updating stripe subscription: invalid existing subscription "${existingStripeSubscription.id}" metadata.projectId for consumer "${consumer.id}"`
    )

    const updateParams: Stripe.SubscriptionUpdateParams = {
      metadata: {
        userId: consumer.userId,
        consumerId: consumer.id,
        projectId: project.id,
        deploymentId: deployment.id
      }
    }

    if (plan) {
      assert(
        pricingPlan,
        404,
        `Unable to update stripe subscription for invalid pricing plan "${plan}"`
      )

      const items: Stripe.SubscriptionUpdateParams.Item[] =
        pricingPlan.lineItems.map((lineItem) => {
          const priceId = getStripePriceIdForPricingPlanLineItem({
            pricingPlan,
            pricingPlanLineItem: lineItem,
            project
          })
          assert(
            priceId,
            500,
            `Error updating stripe subscription: missing expected Stripe Price for plan "${pricingPlan.slug}" line-item "${lineItem.slug}"`
          )

          // An existing Stripe Subscription Item may or may not exist for this
          // LineItem. It should exist if this is an update to an existing
          // LineItem. It won't exist if it's a new LineItem.
          const id = consumer._stripeSubscriptionItemIdMap[lineItem.slug]

          return {
            price: priceId,
            id,
            metadata: {
              lineItemSlug: lineItem.slug
            }
          }
        })

      // Sanity check that LineItems we think should exist are all present in
      // the current subscription's items.
      for (const item of items) {
        if (item.id) {
          const existingItem = existingStripeSubscriptionItems.find(
            (existingItem) => item.id === existingItem.id
          )

          assert(
            existingItem,
            500,
            `Error updating stripe subscription: invalid pricing plan "${plan}" missing existing Subscription Item for "${item.id}"`
          )
        }
      }

      for (const existingItem of existingStripeSubscriptionItems) {
        const updatedItem = items.find((item) => item.id === existingItem.id)

        if (!updatedItem) {
          const deletedItem: Stripe.SubscriptionUpdateParams.Item = {
            id: existingItem.id,
            deleted: true
          }

          items.push(deletedItem)
        }
      }

      assert(
        items.length || !plan,
        500,
        `Error updating stripe subscription "${consumer._stripeSubscriptionId}"`
      )

      for (const item of items) {
        if (!item.id) {
          delete item.id
        }
      }

      updateParams.items = items

      if (pricingPlan.trialPeriodDays) {
        const trialEnd =
          Math.trunc(Date.now() / 1000) +
          24 * 60 * 60 * pricingPlan.trialPeriodDays

        // Reuse the existing trial end date if one exists. Otherwise, set a new
        // one for the updated subscription.
        updateParams.trial_end =
          existingStripeSubscription.trial_end ?? trialEnd
      } else if (existingStripeSubscription.trial_end) {
        // If the existing subscription has a trial end date, but the updated
        // subscription doesn't, we should end the trial now.
        updateParams.trial_end = 'now'
      }

      logger.debug('subscription', action, { items })
    } else {
      updateParams.cancel_at_period_end = true
    }

    // TODO: Stripe Connect
    // if (project.isStripeConnectEnabled && project.applicationFeePercent > 0) {
    //   updateParams.application_fee_percent = project.applicationFeePercent
    // }

    subscription = await stripe.subscriptions.update(
      consumer._stripeSubscriptionId,
      updateParams,
      ...stripeConnectParams
    )

    // TODO: this will cancel the subscription without resolving current usage / invoices
    // await stripe.subscriptions.del(consumer.stripeSubscription)
  } else {
    // Creating a new subscription for this consumer for the first time.
    assert(
      pricingPlan,
      404,
      `Unable to update stripe subscription for invalid pricing plan "${plan}"`
    )

    const items: Stripe.SubscriptionCreateParams.Item[] =
      pricingPlan.lineItems.map((lineItem) => {
        const priceId = getStripePriceIdForPricingPlanLineItem({
          pricingPlan,
          pricingPlanLineItem: lineItem,
          project
        })
        assert(
          priceId,
          500,
          `Error creating stripe subscription: missing expected Stripe Price for plan "${pricingPlan.slug}" line item "${lineItem.slug}"`
        )

        // An existing Stripe Subscription Item may or may not exist for this
        // LineItem. It should exist if this is an update to an existing
        // LineItem. It won't exist if it's a new LineItem.
        const id = consumer._stripeSubscriptionItemIdMap[lineItem.slug]
        assert(
          !id,
          500,
          `Error creating stripe subscription: consumer contains a Stripe Subscription Item for LineItem "${lineItem.slug}" and pricing plan "${pricingPlan.slug}"`
        )

        return {
          price: priceId,
          metadata: {
            lineItemSlug: lineItem.slug
          }
        }
      })

    assert(
      items.length,
      500,
      `Error creating stripe subscription: invalid plan "${plan}"`
    )

    const createParams: Stripe.SubscriptionCreateParams = {
      customer: stripeCustomerId,
      description: `Agentic subscription to project "${project.id}"`,
      // TODO: coupons
      // coupon: filterConsumerCoupon(ctx, consumer, deployment),
      items,
      metadata: {
        userId: consumer.userId,
        consumerId: consumer.id,
        projectId: project.id,
        deploymentId: deployment.id
      }
    }

    if (pricingPlan.trialPeriodDays) {
      createParams.trial_period_days = pricingPlan.trialPeriodDays
    }

    // TODO: Stripe Connect
    // if (project.isStripeConnectEnabled && project.applicationFeePercent > 0) {
    //   createParams.application_fee_percent = project.applicationFeePercent
    // }

    logger.debug('subscription', action, { items })
    subscription = await stripe.subscriptions.create(
      createParams,
      ...stripeConnectParams
    )

    consumer._stripeSubscriptionId = subscription.id
  }

  // ----------------------------------------------------
  // Same codepath for updating, creating, and cancelling
  // ----------------------------------------------------

  assert(subscription, 500, 'Missing stripe subscription')
  logger.debug('subscription', subscription)

  const consumerUpdate: RawConsumerUpdate = consumer
  consumerUpdate.stripeStatus = subscription.status
  setConsumerStripeSubscriptionStatus(consumerUpdate)

  // if (!plan) {
  // TODO: we cancel at the end of the billing interval, so we shouldn't
  // invalidate the stripe subscription just yet. That should happen via
  // webhook. And we should never set `_stripeSubscriptionId` to `null`.
  // consumerUpdate._stripeSubscriptionId = null
  // consumerUpdate.stripeStatus = 'cancelled'
  // }

  if (pricingPlan) {
    for (const lineItem of pricingPlan.lineItems) {
      const stripeSubscriptionItemId =
        consumer._stripeSubscriptionItemIdMap[lineItem.slug]

      const stripeSubscriptionItem: Stripe.SubscriptionItem | undefined =
        subscription.items.data.find((item) =>
          stripeSubscriptionItemId
            ? item.id === stripeSubscriptionItemId
            : item.metadata?.lineItemSlug === lineItem.slug
        )

      assert(
        stripeSubscriptionItem,
        500,
        `Error post-processing stripe subscription for line-item "${lineItem.slug}" on plan "${pricingPlan.slug}"`
      )

      consumerUpdate._stripeSubscriptionItemIdMap![lineItem.slug] =
        stripeSubscriptionItem.id
      assert(
        consumerUpdate._stripeSubscriptionItemIdMap![lineItem.slug],
        500,
        `Error post-processing stripe subscription for line-item "${lineItem.slug}" on plan "${pricingPlan.slug}"`
      )
    }
  }

  logger.debug()
  logger.debug('consumer update', consumerUpdate)

  const [updatedConsumer] = await db
    .update(schema.consumers)
    .set(consumerUpdate)
    .where(eq(schema.consumers.id, consumer.id))
    .returning()
  assert(updatedConsumer, 500, 'Error updating consumer')

  // await auditLog.createStripeSubscriptionLogEntry(ctx, {
  //   consumer,
  //   user,
  //   plan: consumer.plan,
  //   subtype: action
  // })

  return {
    subscription,
    consumer: updatedConsumer
  }
}
