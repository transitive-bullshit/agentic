import { Hono } from 'hono'

import * as middleware from '@/lib/middleware'

import type { AuthenticatedEnv } from './lib/types'

export const app = new Hono()

const pub = new Hono()
const pri = new Hono<AuthenticatedEnv>()

app.route('/', pub)
app.use('*', middleware.authenticate)
app.use('*', middleware.team)
app.use('*', middleware.me)
app.route('/', pri)
