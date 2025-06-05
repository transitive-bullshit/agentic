import * as SentryCloudflare from '@sentry/cloudflare'
import * as SentryNode from '@sentry/node'
import { expectTypeOf, test } from 'vitest'

import type { Sentry } from './sentry'

test('@sentry/node is compatible with simplified Sentry type', () => {
  expectTypeOf(SentryNode).toExtend<Sentry>()
  const sN: Sentry = SentryNode
  expectTypeOf(sN).toExtend<Sentry>()
})

test('@sentry/cloudflare is compatible with simplified Sentry type', () => {
  expectTypeOf(SentryCloudflare).toExtend<Sentry>()
  const sC: Sentry = SentryCloudflare
  expectTypeOf(sC).toExtend<Sentry>()
})
