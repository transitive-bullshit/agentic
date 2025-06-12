import { z } from '@hono/zod-openapi'
import parseIntervalAsMs from 'ms'

// TODO: Consider adding support for this in the future
// export const rateLimitBySchema = z.union([
//   z.literal('ip'),
//   z.literal('customer'),
//   z.literal('all')
// ])

export const rateLimitModeSchema = z.union([
  z.literal('strict'),
  z.literal('approximate')
])

/**
 * Rate limit config for metered LineItems.
 */
export const rateLimitSchema = z
  .union([
    z.object({
      /**
       * Whether or not this rate limit is enabled.
       */
      enabled: z.literal(false)
    }),
    z.object({
      /**
       * The interval at which the rate limit is applied.
       *
       * Either a positive integer expressed in seconds or a valid positive
       * [ms](https://github.com/vercel/ms) string (eg, "10s", "1m", "8h", "2d",
       * "1w", "1y", etc).
       */
      interval: z
        .union([
          z.number().positive(), // seconds

          z
            .string()
            .nonempty()
            .transform((value, ctx) => {
              try {
                // TODO: `ms` module has broken types
                const ms = parseIntervalAsMs(value as any) as unknown as number
                const seconds = Math.floor(ms / 1000)

                if (
                  typeof ms !== 'number' ||
                  Number.isNaN(ms) ||
                  ms <= 0 ||
                  seconds <= 0
                ) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid interval "${value}"`,
                    path: ctx.path
                  })

                  return z.NEVER
                }

                return seconds
              } catch {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Invalid interval "${value}"`,
                  path: ctx.path
                })

                return z.NEVER
              }
            })
        ])
        .describe(
          `The interval at which the rate limit is applied. Either a positive integer expressed in seconds or a valid positive [ms](https://github.com/vercel/ms) string (eg, "10s", "1m", "8h", "2d", "1w", "1y", etc).`
        ),

      /**
       * Maximum number of operations per interval (unitless).
       */
      limit: z
        .number()
        .nonnegative()
        .describe('Maximum number of operations per interval (unitless).'),

      /**
       * How to enforce the rate limit:
       *
       * - `strict` (more precise but slower)
       * - `approximate` (the default; faster and asynchronous but less precise).
       *
       * The default rate-limiting mode is `approximate`, which means that requests
       * are allowed to proceed immediately, with the limit being enforced
       * asynchronously in the background. This is much faster than synchronous
       * mode, but it is less consistent if precise adherence to rate-limits is
       * required.
       *
       * With `strict` mode, requests are blocked until the current limit has
       * been confirmed. The downside with this approach is that it introduces
       * more latency to every request by default. The advantage is that it is
       * more precise and consistent.
       *
       * @default "approximate"
       */
      mode: rateLimitModeSchema
        .optional()
        .default('approximate')
        .describe(
          'How to enforce the rate limit: "strict" (more precise but slower) or "approximate" (the default; faster and asynchronous but less precise).'
        ),

      // TODO: Consider adding support for this in the future
      // /**
      //  * The key to rate-limit by.
      //  *
      //  * - `ip`: Rate-limit by incoming IP address.
      //  * - `customer`: Rate-limit by customer ID if available or IP address
      //  *   otherwise.
      //  * - `global`: Rate-limit all usage globally across customers.
      //  *
      //  * @default 'customer'
      //  */
      // rateLimitBy: rateLimitBySchema.optional().default('customer'),

      /**
       * Whether or not this rate limit is enabled.
       *
       * @default true
       */
      enabled: z.boolean().optional().default(true)
    })
  ])
  .openapi('RateLimit')

export type RateLimitInput = z.input<typeof rateLimitSchema>
export type RateLimit = z.infer<typeof rateLimitSchema>
