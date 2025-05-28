import { z } from '@hono/zod-openapi'
import parseIntervalAsMs from 'ms'

/**
 * Rate limit config for metered LineItems.
 */
export const rateLimitSchema = z
  .object({
    /**
     * The interval at which the rate limit is applied.
     *
     * Either a positive number expressed in seconds or a valid positive
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
        `The interval at which the rate limit is applied. Either a positive number in seconds or a valid positive [ms](https://github.com/vercel/ms) string (eg, "10s", "1m", "8h", "2d", "1w", "1y", etc).`
      ),

    /**
     * Maximum number of operations per interval (unitless).
     */
    maxPerInterval: z
      .number()
      .nonnegative()
      .describe('Maximum number of operations per interval (unitless).')
  })
  .openapi('RateLimit')
export type RateLimitInput = z.input<typeof rateLimitSchema>
export type RateLimit = z.infer<typeof rateLimitSchema>
