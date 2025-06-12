import type { RateLimitResult } from './types'

/**
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-06
 */
export function getRateLimitHeaders(
  rateLimitResult?: RateLimitResult
): Record<string, string> | undefined {
  const headers: Record<string, string> = {}
  if (!rateLimitResult) {
    return undefined
  }

  const { id, limit, remaining, resetTimeMs, intervalMs } = rateLimitResult
  const intervalSeconds = Math.ceil(intervalMs / 1000)
  const resetTimeSeconds = Math.ceil(resetTimeMs / 1000)

  const rateLimitPolicy = `${limit};w=${intervalSeconds}`
  const limitString = limit.toString()
  const remainingString = remaining.toString()
  const resetTimeString = resetTimeSeconds.toString()

  // NOTE: Cloudflare and/or origin servers like to set the x- headers, which
  // can be pretty confusing since the end user gets both ratelimit headers.
  // I'm hesitant to remove any extra origin headers, since they're a nice
  // escape hatch for sending extra metadata, and the origin may in fact have
  // its own separate rate-limiting policy, which we don't necessarily want to
  // hide. So for now, we'll just set the standard rate-limit headers and make
  // sure this distinction is documented.
  headers['ratelimit-policy'] = rateLimitPolicy
  headers['ratelimit-limit'] = limitString
  headers['ratelimit-remaining'] = remainingString
  headers['ratelimit-reset'] = resetTimeString
  headers['x-ratelimit-id'] = id

  if (!rateLimitResult.passed) {
    const retryAfterSeconds = Math.max(
      0,
      Math.ceil((resetTimeMs - Date.now()) / 1000)
    )
    const retryAfterString = retryAfterSeconds.toString()

    headers['retry-after'] = retryAfterString
  }

  return headers
}
