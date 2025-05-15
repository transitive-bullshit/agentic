import * as Sentry from '@sentry/node'

/** Get the ID of the trace from the root span of the current span. */
export function getTraceId(): string | undefined {
  try {
    const activeSpan = Sentry.getActiveSpan()
    const rootSpan = activeSpan ? Sentry.getRootSpan(activeSpan) : undefined
    if (rootSpan) {
      const { traceId } = rootSpan.spanContext()
      return traceId
    }
    return undefined
  } catch (err) {
    Sentry.captureException(err)
    return undefined
  }
}

/** Get the Sentry trace URL for the current span. */
export function getSentryTraceURL(): string {
  const traceId = getTraceId()
  return `https://agentic-platform.sentry.io/performance/trace/${traceId}`
}
