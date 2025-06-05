import type { RawConsumerUpdate } from '@/db'

// https://docs.stripe.com/api/subscriptions/object#subscription_object-status
const stripeValidSubscriptionStatuses = new Set([
  'active',
  'trialing',
  'incomplete',
  'past_due'
])

export function setConsumerStripeSubscriptionStatus(
  consumer: Pick<
    RawConsumerUpdate,
    'plan' | 'stripeStatus' | 'isStripeSubscriptionActive'
  >
) {
  consumer.isStripeSubscriptionActive =
    consumer.plan === 'free' ||
    (!!consumer.stripeStatus &&
      stripeValidSubscriptionStatuses.has(consumer.stripeStatus))
}
