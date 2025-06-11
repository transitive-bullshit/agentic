import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { logger as honoLogger } from 'hono/logger'

import { initExitHooks } from './exit-hooks'
import { registerCustomCacheControlTool } from './routes/custom-cache-control-tool'
import { registerCustomRateLimitTool } from './routes/custom-rate-limit-tool'
import { registerDisabledForFreePlanTool } from './routes/disabled-for-free-plan-tool'
import { registerDisabledRateLimitTool } from './routes/disabled-rate-limit-tool'
import { registerDisabledTool } from './routes/disabled-tool'
import { registerEcho } from './routes/echo'
import { registerGetUser } from './routes/get-user'
import { registerHealthCheck } from './routes/health-check'
import { registerNoCacheCacheControlTool } from './routes/no-cache-cache-control-tool'
import { registerNoStoreCacheControlTool } from './routes/no-store-cache-control-tool'
import { registerPure } from './routes/pure'
import { registerUnpureMarkedPure } from './routes/unpure-marked-pure'

export const app = new OpenAPIHono()

app.use(honoLogger())

registerHealthCheck(app)
registerGetUser(app)
registerDisabledTool(app)
registerDisabledForFreePlanTool(app)
registerEcho(app)
registerPure(app)
registerUnpureMarkedPure(app)
registerCustomCacheControlTool(app)
registerNoStoreCacheControlTool(app)
registerNoCacheCacheControlTool(app)
registerCustomRateLimitTool(app)
registerDisabledRateLimitTool(app)

app.doc31('/docs', {
  openapi: '3.1.0',
  info: {
    title: 'OpenAPI server everything',
    description:
      "OpenAPI kitchen sink server meant for testing Agentic's origin OpenAPI adapter and ToolConfig features.",
    version: '0.1.0'
  }
})

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3081
export const server = serve({
  fetch: app.fetch,
  port
})

initExitHooks({ server })

console.log(`Server running on port ${port}`)
