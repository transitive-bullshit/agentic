import '@/lib/external/sentry'

import { type DefaultHonoEnv, errorHandler } from '@agentic/platform-hono'
import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import * as Sentry from '@sentry/node'

import { apiV1 } from '@/api-v1'
import { env } from '@/lib/env'
import * as middleware from '@/lib/middleware'

import { initExitHooks } from './lib/exit-hooks'

export const app = new OpenAPIHono<DefaultHonoEnv>()

app.onError(errorHandler)
app.use(middleware.sentry())
app.use(middleware.compress())
app.use(
  middleware.cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true
  })
)
app.use(middleware.init)
app.use(middleware.accessLogger)
app.use(middleware.responseTime)

// TODO: top-level auth routes

// Mount all v1 API routes
app.route('/v1', apiV1)

app.doc31('/docs', {
  openapi: '3.1.0',
  info: { title: 'Agentic', version: '0.1.0' }
})

const server = serve({
  fetch: (req, bindings) =>
    app.fetch(req, { ...bindings, ...env, sentry: Sentry }),
  port: env.PORT
})

initExitHooks({ server })

// eslint-disable-next-line no-console
console.log(`Server running on port ${env.PORT}`)
