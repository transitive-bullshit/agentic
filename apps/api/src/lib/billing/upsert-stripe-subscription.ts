import type Stripe from 'stripe'

import {
  type ConsumerUpdate,
  db,
  eq,
  type RawConsumer,
  type RawDeployment,
  type RawProject,
  type RawUser,
  schema
} from '@/db'
import { stripe } from '@/lib/stripe'
import { assert } from '@/lib/utils'

export async function upsertStripeSubscription({
  consumer,
  user,
  deployment,
  project
}: {
  consumer: RawConsumer
  user: RawUser
  deployment: RawDeployment
  project: RawProject
}): Promise<{
  subscription: Stripe.Subscription
  consumer: RawConsumer
}> {
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

  const action: 'create' | 'update' | 'cancel' = consumer.stripeSubscriptionId
    ? plan
      ? 'update'
      : 'cancel'
    : 'create'
  let subscription: Stripe.Subscription | undefined

  if (consumer.stripeSubscriptionId) {
    // customer has an existing subscription
    const existing = await stripe.subscriptions.retrieve(
      consumer.stripeSubscriptionId,
      ...stripeConnectParams
    )
    const existingItems = existing.items.data
    console.log()
    console.log('existing subscription', JSON.stringify(existing, null, 2))
    console.log()

    const update: Stripe.SubscriptionUpdateParams = {}

    if (plan) {
      assert(
        pricingPlan,
        404,
        `Unable to update stripe subscription for invalid pricing plan "${plan}"`
      )

      let items: Stripe.SubscriptionUpdateParams.Item[] = [
        {
          plan: pricingPlan.stripeBasePlanId,
          id: consumer.stripeSubscriptionBaseItemId
        },
        {
          plan: pricingPlan.stripeRequestPlanId,
          id: consumer.stripeSubscriptionRequestItemId
        }
      ]

      for (const metric of pricingPlan.metrics) {
        const { slug: metricSlug } = metric
        console.log({
          metricSlug,
          plan: pricingPlan.stripeMetricPlans[metricSlug],
          id: consumer.stripeSubscriptionMetricItems[metricSlug]
        })

        items.push({
          plan: pricingPlan.stripeMetricPlans[metricSlug]!,
          id: consumer.stripeSubscriptionMetricItems[metricSlug]
        })
      }

      const invalidItems = items.filter((item) => !item.plan)
      if (plan && invalidItems.length) {
        console.error('billing warning found invalid items', invalidItems)
      }

      items = items.filter((item) => item.plan)

      for (const item of items) {
        if (item.id) {
          const existingItem = existingItems.find(
            (existingItem) => item.id === existingItem.id
          )

          if (!existingItem) {
            console.error(
              'billing warning found new item that has a subscription item id but should not',
              { item }
            )
            delete item.id
          }
        }
      }

      // TODO: We should never use clear_usage because it causes us to lose money.
      // A customer could downgrade their subscription at the end of a pay period
      // and this would clear all usage for their period, effectively allowing them
      // to hack the service for free usage.
      // The solution to this problem is to always have an equivalent free plan for
      // every paid plan.

      for (const existingItem of existingItems) {
        const updatedItem = items.find((item) => item.id === existingItem.id)

        if (!updatedItem) {
          const deletedItem: Stripe.SubscriptionUpdateParams.Item = {
            id: existingItem.id,
            deleted: true
          }

          if (existingItem.plan.usage_type === 'metered') {
            deletedItem.clear_usage = true
          }

          items.push(deletedItem)
        }
      }

      assert(
        items.length || !plan,
        500,
        `Error updating stripe subscription "${consumer.stripeSubscriptionId}"`
      )

      for (const item of items) {
        if (!item.id) {
          delete item.id
        }
      }

      update.items = items

      if (pricingPlan.trialPeriodDays) {
        update.trial_end =
          Math.trunc(Date.now() / 1000) +
          24 * 60 * 60 * pricingPlan.trialPeriodDays
      }

      console.log('subscription', action, { items })
    } else {
      update.cancel_at_period_end = true
    }

    if (project.isStripeConnectEnabled && project.applicationFeePercent > 0) {
      update.application_fee_percent = project.applicationFeePercent
    }

    subscription = await stripe.subscriptions.update(
      consumer.stripeSubscriptionId,
      update,
      ...stripeConnectParams
    )

    // TODO: this will cancel the subscription without resolving current usage / invoices
    // await stripe.subscriptions.del(consumer.stripeSubscription)
  } else {
    assert(
      pricingPlan,
      404,
      `Unable to update stripe subscription for invalid pricing plan "${plan}"`
    )

    let items: Stripe.SubscriptionCreateParams.Item[] = [
      {
        plan: pricingPlan.stripeBasePlanId
      },
      {
        plan: pricingPlan.stripeRequestPlanId
      }
    ]

    for (const metric of pricingPlan.metrics) {
      const { slug: metricSlug } = metric
      items.push({
        plan: pricingPlan.stripeMetricPlans[metricSlug]!
      })
    }

    items = items.filter((item) => item.plan)
    assert(
      items.length,
      500,
      `Error creating stripe subscription for invalid plan "${pricingPlan.slug}"`
    )

    const createParams: Stripe.SubscriptionCreateParams = {
      customer: stripeCustomerId,
      // TODO: coupons
      // coupon: filterConsumerCoupon(ctx, consumer, deployment),
      items,
      metadata: {
        userId: consumer.userId,
        consumerId: consumer.id,
        projectId: project.id,
        deployment: deployment.id
      }
    }

    if (pricingPlan.trialPeriodDays) {
      createParams.trial_period_days = pricingPlan.trialPeriodDays
    }

    if (project.isStripeConnectEnabled && project.applicationFeePercent > 0) {
      createParams.application_fee_percent = project.applicationFeePercent
    }

    console.log('subscription', action, { items })
    subscription = await stripe.subscriptions.create(
      createParams,
      ...stripeConnectParams
    )

    consumer.stripeSubscriptionId = subscription.id
  }

  assert(subscription, 500, 'Missing stripe subscription')

  console.log()
  console.log('subscription', JSON.stringify(subscription, null, 2))
  console.log()

  const consumerUpdate: ConsumerUpdate = consumer

  if (plan) {
    consumerUpdate.stripeStatus = subscription.status
  } else {
    // TODO
    consumerUpdate.stripeSubscriptionId = null
    consumerUpdate.stripeStatus = 'cancelled'
  }

  if (pricingPlan?.stripeBasePlanId) {
    const subscriptionItem = subscription.items.data.find(
      (item) => item.plan.id === pricingPlan.stripeBasePlanId
    )
    assert(
      subscriptionItem,
      500,
      `Error initializing stripe subscription for base plan "${subscription.id}"`
    )

    consumerUpdate.stripeSubscriptionBaseItemId = subscriptionItem.id
    assert(
      consumerUpdate.stripeSubscriptionBaseItemId,
      500,
      `Error initializing stripe subscription for base plan [${subscription.id}]`
    )
  } else {
    // TODO
    consumerUpdate.stripeSubscriptionBaseItemId = null
  }

  if (pricingPlan?.stripeRequestPlanId) {
    const subscriptionItem = subscription.items.data.find(
      (item) => item.plan.id === pricingPlan.stripeRequestPlanId
    )
    assert(
      subscriptionItem,
      500,
      `Error initializing stripe subscription for metric "requests" on plan "${subscription.id}"`
    )

    consumerUpdate.stripeSubscriptionRequestItemId = subscriptionItem.id
    assert(
      consumerUpdate.stripeSubscriptionRequestItemId,
      500,
      `Error initializing stripe subscription for metric "requests" on plan "${subscription.id}"`
    )
  } else {
    // TODO
    consumerUpdate.stripeSubscriptionRequestItemId = null
  }

  const metricSlugs = (
    pricingPlan?.metrics.map((metric) => metric.slug) ?? []
  ).concat(Object.keys(consumer.stripeSubscriptionMetricItems))

  const isMetricInPricingPlan = (metricSlug: string) =>
    pricingPlan?.metrics.find((metric) => metric.slug === metricSlug)

  for (const metricSlug of metricSlugs) {
    console.log({
      metricSlug,
      pricingPlan
    })
    const metricPlan = pricingPlan?.stripeMetricPlans[metricSlug]

    if (metricPlan) {
      const subscriptionItem: Stripe.SubscriptionItem | undefined =
        subscription.items.data.find((item) => item.plan.id === metricPlan)

      if (isMetricInPricingPlan(metricSlug)) {
        assert(
          subscriptionItem,
          500,
          `Error initializing stripe subscription for metric "${metricSlug}" on plan [${subscription.id}]`
        )

        consumerUpdate.stripeSubscriptionMetricItems![metricSlug] =
          subscriptionItem.id
        assert(
          consumerUpdate.stripeSubscriptionMetricItems![metricSlug],
          500,
          `Error initializing stripe subscription for metric "${metricSlug}" on plan [${subscription.id}]`
        )
      }
    } else {
      // TODO
      consumerUpdate.stripeSubscriptionMetricItems![metricSlug] = null
    }
  }

  console.log()
  console.log()
  console.log('consumer update', {
    ...consumer,
    ...consumerUpdate
  })
  console.log()

  const [updatedConsumer] = await db
    .update(schema.consumers)
    .set(consumerUpdate as any) // TODO
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
