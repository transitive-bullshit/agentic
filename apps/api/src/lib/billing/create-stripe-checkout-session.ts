import type Stripe from 'stripe'
import { assert } from '@agentic/platform-core'

import type { AuthenticatedHonoContext } from '@/lib/types'
import {
  getStripePriceIdForPricingPlanLineItem,
  type RawConsumer,
  type RawDeployment,
  type RawProject,
  type RawUser
} from '@/db'
import { stripe } from '@/lib/external/stripe'

import { env } from '../env'

export async function createStripeCheckoutSession(
  ctx: AuthenticatedHonoContext,
  {
    consumer,
    user,
    deployment,
    project,
    plan
  }: {
    consumer: RawConsumer
    user: RawUser
    deployment: RawDeployment
    project: RawProject
    plan?: string
  }
): Promise<{ id: string; url: string }> {
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

  const pricingPlan = plan
    ? deployment.pricingPlans.find((pricingPlan) => pricingPlan.slug === plan)
    : undefined

  const action: 'create' | 'update' | 'cancel' = consumer._stripeSubscriptionId
    ? plan
      ? 'update'
      : 'cancel'
    : 'create'

  // TODO: test cancel => resubscribe flow

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

    if (!plan) {
      const billingPortalSession = await stripe.billingPortal.sessions.create(
        {
          customer: stripeCustomerId,
          return_url: `${env.AGENTIC_WEB_BASE_URL}/app/consumers`,
          flow_data: {
            type: 'subscription_cancel',
            subscription_cancel: {
              subscription: consumer._stripeSubscriptionId
            },
            after_completion: {
              type: 'redirect',
              redirect: {
                return_url: `${env.AGENTIC_WEB_BASE_URL}/app/consumers/${consumer.id}?checkout=canceled`
              }
            }
          }
        },
        ...stripeConnectParams
      )

      return {
        id: billingPortalSession.id,
        url: billingPortalSession.url
      }
    }

    const updateParams: Stripe.SubscriptionUpdateParams = {
      collection_method: 'charge_automatically',
      metadata: {
        plan: plan ?? null,
        consumerId: consumer.id,
        userId: consumer.userId,
        projectId: project.id,
        deploymentId: deployment.id
      }
    }

    assert(
      pricingPlan,
      404,
      `Unable to update stripe subscription for invalid pricing plan "${plan}"`
    )

    const items: Stripe.SubscriptionUpdateParams.Item[] = await Promise.all(
      pricingPlan.lineItems.map(async (lineItem) => {
        const priceId = await getStripePriceIdForPricingPlanLineItem({
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
    )

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
      updateParams.trial_end = existingStripeSubscription.trial_end ?? trialEnd
    } else if (existingStripeSubscription.trial_end) {
      // If the existing subscription has a trial end date, but the updated
      // subscription doesn't, we should end the trial now.
      updateParams.trial_end = 'now'
    }

    logger.info('>>> subscription', action, { items })

    // TODO: Stripe Connect
    // if (project.isStripeConnectEnabled && project.applicationFeePercent > 0) {
    //   updateParams.application_fee_percent = project.applicationFeePercent
    // }

    const subscription = await stripe.subscriptions.update(
      consumer._stripeSubscriptionId,
      updateParams,
      ...stripeConnectParams
    )

    logger.info('<<< subscription', action, subscription)

    const billingPortalSession = await stripe.billingPortal.sessions.create(
      {
        customer: stripeCustomerId,
        return_url: `${env.AGENTIC_WEB_BASE_URL}/app/consumers`
      },
      ...stripeConnectParams
    )

    return {
      id: billingPortalSession.id,
      url: billingPortalSession.url
    }
  } else {
    // Creating a new subscription for this consumer for the first time.
    assert(
      pricingPlan,
      404,
      `Unable to update stripe subscription for invalid pricing plan "${plan}"`
    )

    const items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      await Promise.all(
        pricingPlan.lineItems.map(async (lineItem) => {
          // An existing Stripe Subscription Item may or may not exist for this
          // LineItem. It should exist if this is an update to an existing
          // LineItem. It won't exist if it's a new LineItem.
          const id = consumer._stripeSubscriptionItemIdMap[lineItem.slug]
          assert(
            !id,
            500,
            `Error creating stripe subscription: consumer contains a Stripe Subscription Item for LineItem "${lineItem.slug}" and pricing plan "${pricingPlan.slug}"`
          )

          const priceId = await getStripePriceIdForPricingPlanLineItem({
            pricingPlan,
            pricingPlanLineItem: lineItem,
            project
          })
          assert(
            priceId,
            500,
            `Error creating stripe subscription: missing expected Stripe Price for plan "${pricingPlan.slug}" line item "${lineItem.slug}"`
          )

          return {
            price: priceId,
            // TODO: Make this customizable
            quantity: lineItem.usageType === 'licensed' ? 1 : undefined
            // metadata: {
            //   lineItemSlug: lineItem.slug
            // }
          } satisfies Stripe.Checkout.SessionCreateParams.LineItem
        })
      )

    assert(
      items.length,
      500,
      `Error creating stripe subscription: invalid plan "${plan}"`
    )

    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: items,
      success_url: `${env.AGENTIC_WEB_BASE_URL}/app/consumers/${consumer.id}?checkout=success&plan=${plan}`,
      cancel_url: `${env.AGENTIC_WEB_BASE_URL}/marketplace/projects/${project.identifier}?checkout=canceled`,
      submit_type: 'subscribe',
      saved_payment_method_options: {
        payment_method_save: 'enabled'
      },
      subscription_data: {
        description:
          pricingPlan.description ??
          `Subscription to ${project.name} ${pricingPlan.name}`,
        trial_period_days: pricingPlan.trialPeriodDays,
        metadata: {
          plan: plan ?? null,
          consumerId: consumer.id,
          userId: consumer.userId,
          projectId: project.id,
          deploymentId: deployment.id
        }
        // TODO: Stripe Connect
        // application_fee_percent: project.applicationFeePercent
      },
      // TODO: coupons
      // coupon: filterConsumerCoupon(ctx, consumer, deployment),
      // TODO: discounts
      // collection_method: 'charge_automatically',
      // TODO: consider custom_fields
      // TODO: consider custom_text
      // TODO: consider optional_items
      metadata: {
        plan: plan ?? null,
        consumerId: consumer.id,
        userId: consumer.userId,
        projectId: project.id,
        deploymentId: deployment.id
      }
    }

    // TODO: Stripe Connect
    // if (project.isStripeConnectEnabled && project.applicationFeePercent > 0) {
    //   createParams.application_fee_percent = project.applicationFeePercent
    // }

    logger.debug('checkout session line_items', items)
    const checkoutSession = await stripe.checkout.sessions.create(
      checkoutSessionParams,
      ...stripeConnectParams
    )
    assert(checkoutSession.url, 500, 'Missing stripe checkout session URL')

    return {
      id: checkoutSession.id,
      url: checkoutSession.url
    }
  }
}
