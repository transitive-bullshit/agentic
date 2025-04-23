import { Hono } from 'hono'

import type { AuthenticatedEnv } from '@/lib/types'
import * as middleware from '@/lib/middleware'

import { healthCheck } from './health-check'

export const apiV1 = new Hono()

const pub = new Hono()
const pri = new Hono<AuthenticatedEnv>()

pub.get('/health', healthCheck)

apiV1.route('', pub)
apiV1.use(middleware.authenticate)
apiV1.use(middleware.team)
apiV1.use(middleware.me)
apiV1.route('', pri)
