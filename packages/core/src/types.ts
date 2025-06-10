export interface Logger {
  trace(message?: any, ...detail: any[]): void
  debug(message?: any, ...detail: any[]): void
  info(message?: any, ...detail: any[]): void
  warn(message?: any, ...detail: any[]): void
  error(message?: any, ...detail: any[]): void
}

export type RateLimitResult = {
  /**
   * The identifier used to uniquely track this rate limit.
   *
   * This will generally be the customer's ID or IP address.
   */
  id: string

  /**
   * Whether or not the request passed the rate limit.
   */
  passed: boolean

  /**
   * The current number of requests that have been made against the rate limit.
   */
  current: number

  /**
   * The maximum number of requests that can be made per interval.
   */
  limit: number

  /**
   * The number of requests that can be made before the rate limit resets.
   *
   * Will be `0` if the rate limit has been exceeded.
   */
  remaining: number

  /**
   * The time in milliseconds since the Unix epoch at which the rate limit
   * will reset.
   */
  resetTimeMs: number

  /**
   * The interval in milliseconds over which the rate limit is enforced.
   */
  intervalMs: number
}
