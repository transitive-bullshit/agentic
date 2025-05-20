import type { RawConsumerUpdate } from '@/db'

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
