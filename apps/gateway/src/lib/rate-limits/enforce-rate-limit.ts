import { assert } from '@agentic/platform-core'

import type { RawEnv } from '../env'
import type { RateLimitCache, RateLimitResult, RateLimitState } from '../types'

/**
 * This maps persists across worker executions and is used for caching active
 * rate limits. It's purely a performance optimization for `async` rate limits
 * and is not used as a source of truth.
 */
const globalRateLimitCache: RateLimitCache = new Map()

export async function enforceRateLimit({
  id,
  interval,
  maxPerInterval,
  cost = 1,
  async = true,
  env,
  cache = globalRateLimitCache,
  waitUntil
}: {
  /**
   * The identifier used to uniquely track this rate limit.
   */
  id: string

  /**
   * Interval in seconds over which the rate limit is enforced.
   */
  interval: number

  /**
   * Maximum number of requests that can be made per interval.
   */
  maxPerInterval: number

  /**
   * The cost of the request.
   *
   * @default 1
   */
  cost?: number

  /**
   * Whether to enforce the rate limit synchronously or asynchronously.
   *
   * @default true (asynchronous)
   */
  async?: boolean

  env: RawEnv
  cache?: RateLimitCache
  waitUntil: (promise: Promise<any>) => void
}): Promise<RateLimitResult> {
  assert(id, 400, 'Unauthenticated requests must have a valid IP address')

  const intervalMs = interval * 1000
  const now = Date.now()

  let rateLimitState: RateLimitState = cache.get(id) ?? {
    current: 0,
    resetTimeMs: now + intervalMs
  }

  function updateCache(info: RateLimitState) {
    const current = cache.get(id)?.current ?? 0
    if (current && info.current > current) {
      cache.set(id, info)
      rateLimitState = info
    }
  }

  /**
   * Short-circuit check for active rate limits that are currently exceeded.
   *
   * This might not happen too often, but in extreme cases the cache should hit
   * and we can skip the request to the durable object entirely, which speeds
   * everything up and is cheaper for us.
   */
  if (
    rateLimitState.current > maxPerInterval &&
    now <= rateLimitState.resetTimeMs
  ) {
    return {
      id,
      passed: false,
      current: rateLimitState.current,
      limit: maxPerInterval,
      resetTimeMs: rateLimitState.resetTimeMs,
      intervalMs,
      remaining: Math.max(0, maxPerInterval - rateLimitState.current)
    }
  }

  const did = env.DO_RATE_LIMITER.idFromName(id)
  const obj = env.DO_RATE_LIMITER.get(did)

  const updatedRateLimitStateP = obj.update({ cost, intervalMs })

  if (async) {
    waitUntil(
      updatedRateLimitStateP
        .then((updatedRateLimitState: RateLimitState) => {
          updateCache(updatedRateLimitState)
        })
        .catch((err: Error) => {
          // eslint-disable-next-line no-console
          console.error(
            `error updating rate limit for id "${id}": ${err.message}`
          )
        })
    )

    rateLimitState.current += cost
    updateCache(rateLimitState)
  } else {
    const updatedRateLimitState = await updatedRateLimitStateP
    updateCache(updatedRateLimitState)
  }

  return {
    id,
    passed: rateLimitState.current <= maxPerInterval,
    current: rateLimitState.current,
    limit: maxPerInterval,
    resetTimeMs: rateLimitState.resetTimeMs,
    intervalMs,
    remaining: Math.max(0, maxPerInterval - rateLimitState.current)
  }
}
