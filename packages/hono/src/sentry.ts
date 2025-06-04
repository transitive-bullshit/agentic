import type { getActiveSpan, getRootSpan } from '@sentry/core'
import * as SentryCloudflare from '@sentry/cloudflare'
import * as SentryNode from '@sentry/node'

export type Sentry = {
  // Simplify the type a bit because the optional second hint argument has
  // changed between different core versions quite a bit.
  captureException: (exception: unknown) => void | string
  getActiveSpan: typeof getActiveSpan
  getRootSpan: typeof getRootSpan
}

export const sN: Sentry = SentryNode
export const sC: Sentry = SentryCloudflare
