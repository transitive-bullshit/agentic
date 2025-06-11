import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { logger as honoLogger } from 'hono/logger'

import { initExitHooks } from './exit-hooks'
import { registerGetUser } from './routes/get-user'
import { registerHealthCheck } from './routes/health-check'

export const app = new OpenAPIHono()

app.use(honoLogger())

registerHealthCheck(app)
registerGetUser(app)

app.doc31('/docs', {
  openapi: '3.1.0',
  info: { title: 'OpenAPI server to test everything', version: '0.1.0' }
})

const port = 3081
export const server = serve({
  fetch: app.fetch,
  port
})

initExitHooks({ server })

console.log(`Server running on port ${port}`)
