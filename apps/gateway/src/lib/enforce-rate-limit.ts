import { assert } from '@agentic/platform-core'

// https://developers.cloudflare.com/durable-objects/examples/build-a-rate-limiter/
// https://github.com/rhinobase/hono-rate-limiter/blob/main/packages/cloudflare/src/stores/DurableObjectStore.ts
// https://github.com/rhinobase/hono-rate-limiter/blob/main/packages/core/src/core.ts

export async function enforceRateLimit({
  id,
  interval,
  maxPerInterval
}: {
  id?: string
  interval: number
  maxPerInterval: number
}) {
  assert(id, 400, 'Unauthenticated requests must have a valid IP address')

  // TODO
  assert(id, 500, 'not implemented')
  assert(interval > 0, 500, 'not implemented')
  assert(maxPerInterval >= 0, 500, 'not implemented')
}
