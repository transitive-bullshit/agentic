import * as Sentry from '@sentry/node'

/** Get the URL for the logs in the GCP console. */
function getGCPLogsUrl(): string {
  const timestamp = new Date().toISOString()
  const queryParts = [
    'resource.type = "cloud_run_revision"',
    'resource.labels.service_name = "agentic"'
  ]
  const traceId = getTraceId()

  if (traceId) {
    queryParts.push(`jsonPayload.meta.traceId = "${traceId}"`)
  }

  const query = queryParts.join(' AND ')
  const url = `https://console.cloud.google.com/logs/query;query=${encodeURIComponent(
    query
  )};summaryFields=jsonPayload%252Fmeta%252FtraceId:false:32:beginning;aroundTime=${timestamp};duration=PT1H?project=agentic-internal-tools`

  return url
}

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

/** Get the Sentry trace link for the current span. */
function getSentryTraceURL(): string {
  const traceId = getTraceId()
  return `https://agentic-platform.sentry.io/performance/trace/${traceId}`
}

/**
 * Get the logs and trace URLs for the current event.
 */
export function getDebugURLs(): { logs: string; trace: string } {
  return {
    logs: getGCPLogsUrl(),
    trace: getSentryTraceURL()
  }
}
