import * as Sentry from '@sentry/cloudflare'

import { app } from './app'
import { type Env, parseEnv, type RawEnv } from './lib/env'

// Export Durable Objects for cloudflare
export { DurableMcpClient } from './lib/durable-mcp-client'
export { DurableMcpServer } from './lib/durable-mcp-server'
export { DurableRateLimiter } from './lib/rate-limits/durable-rate-limiter'

// Main worker entrypoint
export default Sentry.withSentry(
  (env: RawEnv) => ({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT,
    integrations: [Sentry.extraErrorDataIntegration()],
    tracesSampleRate: 1.0,
    sendDefaultPii: true
  }),
  {
    async fetch(
      request: Request,
      env: Env,
      ctx: ExecutionContext
    ): Promise<Response> {
      let parsedEnv: Env

      // Validate the environment
      try {
        parsedEnv = parseEnv(env)
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('api gateway error invalid env:', err.message)

        return new Response(
          JSON.stringify({ error: 'Invalid api gateway environment' }),
          {
            status: 500,
            headers: {
              'content-type': 'application/json'
            }
          }
        )
      }

      // Handle the request with `hono`
      return app.fetch(request, parsedEnv, ctx)
    }
  } satisfies ExportedHandler<Env>
)
