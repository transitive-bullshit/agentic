import type { RawConsumer } from '@/db'
import type { AuthenticatedHonoContext } from '@/lib/types'
import { setPublicCacheControl } from '@/lib/cache-control'
import { env } from '@/lib/env'

export function setAdminCacheControlForConsumer(
  c: AuthenticatedHonoContext,
  consumer: RawConsumer
) {
  if (
    consumer.plan === 'free' ||
    !consumer.activated ||
    !consumer.isStripeSubscriptionActive
  ) {
    // TODO: should we cache free-tier consumers for longer on prod?
    // We really don't want free tier customers to cause our backend API so
    // much traffic, but we'd also like for customers upgrading to a paid tier
    // to have a snappy, smooth experience – without having to wait for their
    // free tier subscription to expire from the cache.
    setPublicCacheControl(c.res, env.isProd ? '30s' : '10s')
  } else {
    // We don't want the gateway hitting our API too often, so cache active
    // customer subscriptions for longer in production
    setPublicCacheControl(c.res, env.isProd ? '30m' : '1m')
  }
}
