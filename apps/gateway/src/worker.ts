import { app } from './app'
import { type Env, parseEnv } from './lib/env'

// Export Durable Objects for cloudflare
export { DurableObjectRateLimiter } from './durable-object'

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    let parsedEnv: Env

    try {
      parsedEnv = parseEnv(env)
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    return app.fetch(request, parsedEnv, ctx)
  }
} satisfies ExportedHandler<Env>
