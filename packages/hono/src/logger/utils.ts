import { captureException, getActiveSpan, getRootSpan } from '@sentry/core'

/** Get the ID of the trace from the root span of the current span. */
export function getTraceId(): string | undefined {
  try {
    const activeSpan = getActiveSpan()
    const rootSpan = activeSpan ? getRootSpan(activeSpan) : undefined
    if (rootSpan) {
      const { traceId } = rootSpan.spanContext()
      return traceId
    }
    return undefined
  } catch (err) {
    captureException(err)
    return undefined
  }
}

/** Get the Sentry trace URL for the current span. */
export function getSentryTraceURL(): string {
  const traceId = getTraceId()
  return `https://agentic-platform.sentry.io/performance/trace/${traceId}`
}
