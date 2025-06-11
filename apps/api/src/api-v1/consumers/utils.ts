import type { Consumer } from '@/db'
import type { AuthenticatedHonoContext } from '@/lib/types'
import { setPublicCacheControl } from '@/lib/cache-control'

export function setAdminCacheControlForConsumer(
  c: AuthenticatedHonoContext,
  consumer: Consumer
) {
  if (
    consumer.plan === 'free' ||
    !consumer.activated ||
    !consumer.isStripeSubscriptionActive
  ) {
    setPublicCacheControl(c.res, '10s')
  } else {
    setPublicCacheControl(c.res, '1m')
  }
}
