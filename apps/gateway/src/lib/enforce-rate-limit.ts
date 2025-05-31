import { assert } from '@agentic/platform-core'

import type { Context } from './types'

export async function enforceRateLimit(
  ctx: Context,
  {
    id,
    interval,
    maxPerInterval,
    method,
    pathname
  }: {
    id?: string
    interval: number
    maxPerInterval: number
    method: string
    pathname: string
  }
) {
  assert(id, 400, 'Unauthenticated requests must have a valid IP address')

  // TODO
  assert(ctx, 500, 'not implemented')
  assert(id, 500, 'not implemented')
  assert(interval > 0, 500, 'not implemented')
  assert(maxPerInterval >= 0, 500, 'not implemented')
  assert(method, 500, 'not implemented')
  assert(pathname, 500, 'not implemented')
}
