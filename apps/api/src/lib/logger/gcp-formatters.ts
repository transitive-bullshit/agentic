import type { pino } from 'pino'
import { EventId } from 'eventid'

/** ==========================================================================
 * GCP logging helpers taken from their official repo.
 * @see https://github.com/GoogleCloudPlatform/cloud-solutions/blob/main/projects/pino-logging-gcp-config/src/pino_gcp_config.ts
 * ======================================================================== */

/** Monotonically increasing ID for insertId. */
const eventId = new EventId()

const PINO_TO_GCP_LOG_LEVELS = Object.freeze(
  Object.fromEntries([
    ['trace', 'DEBUG'],
    ['debug', 'DEBUG'],
    ['info', 'INFO'],
    ['warn', 'WARNING'],
    ['error', 'ERROR'],
    ['fatal', 'CRITICAL']
  ])
) as Record<pino.Level, string>

/**
 * Converts pino log level to Google severity level.
 *
 * @see pino.LoggerOptions.formatters.level
 */
export function pinoLevelToGcpSeverity(
  pinoSeverityLabel: string,
  pinoSeverityLevel: number
): Record<string, unknown> {
  const pinoLevel = pinoSeverityLabel as pino.Level
  const severity = PINO_TO_GCP_LOG_LEVELS[pinoLevel] ?? 'INFO'
  return {
    severity,
    level: pinoSeverityLevel
  }
}

/**
 * Creates a JSON fragment string containing the timestamp in GCP logging
 * format.
 *
 * @example ', "timestamp": { "seconds": 123456789, "nanos": 123000000 }'
 *
 * Creating a string with seconds/nanos is ~10x faster than formatting the
 * timestamp as an ISO string.
 *
 * @see https://cloud.google.com/logging/docs/agent/logging/configuration#timestamp-processing
 *
 * As Javascript Date uses millisecond precision, in
 * {@link formatLogObject} the logger adds a monotonically increasing insertId
 * into the log object to preserve log order inside GCP logging.
 *
 * @see https://github.com/googleapis/nodejs-logging/blob/main/src/entry.ts#L189
 */
export function getGcpLoggingTimestamp() {
  const seconds = Date.now() / 1000
  const secondsRounded = Math.floor(seconds)

  // The following line is 2x as fast as seconds % 1000
  // Uses Math.round, not Math.floor due to JS floating point...
  // eg for a Date.now()=1713024754120
  // (seconds-secondsRounded)*1000 => 119.99988555908203
  const millis = Math.round((seconds - secondsRounded) * 1000)

  return `,"timestamp":{"seconds":${secondsRounded},"nanos":${millis}000000}`
}

/**
 * Reformats log entry record for GCP.
 *
 * * Adds OpenTelemetry properties with correct key.
 * * Adds stack_trace if an Error is given in the err property.
 * * Adds serviceContext
 * * Adds sequential insertId to preserve logging order.
 */
export function formatGcpLogObject(
  entry: Record<string, unknown>
): Record<string, unknown> {
  // OpenTelemetry adds properties trace_id, span_id, trace_flags. If these
  // are present, not null and not blank, convert them to the property keys
  // specified by GCP logging.
  //
  // @see https://cloud.google.com/logging/docs/structured-logging#special-payload-fields
  // @see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#trace-context-fields
  if ((entry.trace_id as string | undefined)?.length) {
    entry['logging.googleapis.com/trace'] = entry.trace_id
    delete entry.trace_id
  }

  if ((entry.span_id as string | undefined)?.length) {
    entry['logging.googleapis.com/spanId'] = entry.span_id
    delete entry.span_id
  }

  // Trace flags is a bit field even though there is one on defined bit,
  // so lets convert it to an int and test against a bitmask.
  // @see https://www.w3.org/TR/trace-context/#trace-flags
  const traceFlagsBits = Number.parseInt(entry.trace_flags as string)
  if (!!traceFlagsBits && (traceFlagsBits & 0x1) === 1) {
    entry['logging.googleapis.com/trace_sampled'] = true
  }
  delete entry.trace_flags

  // If there is an Error, add the stack trace for Event Reporting.
  if (entry.err instanceof Error && entry.err.stack) {
    entry.stack_trace = entry.err.stack
  }

  // Add a sequential EventID.
  //
  // This is required because Javascript Date has a very coarse granularity
  // (millisecond), which makes it quite likely that multiple log entries
  // would have the same timestamp.
  //
  // The GCP Logging API doesn't guarantee to preserve insertion order for
  // entries with the same timestamp. The service does use `insertId` as a
  // secondary ordering for entries with the same timestamp. `insertId` needs
  // to be globally unique (within the project) however.
  //
  // We use a globally unique monotonically increasing EventId as the
  // insertId.
  //
  // @see https://github.com/googleapis/nodejs-logging/blob/main/src/entry.ts#L189
  entry['logging.googleapis.com/insertId'] = eventId.new()

  return entry
}
