import fs from 'node:fs'

import * as Sentry from '@sentry/node'
import { type Logger, pino } from 'pino'

import { isBrowser, isDev, isProd } from '@/lib/env'

import {
  formatGcpLogObject,
  getGcpLoggingTimestamp,
  pinoLevelToGcpSeverity
} from './gcp-formatters'
import { getTraceId } from './utils'

const gcpTransportPath = `${import.meta.dirname}/gcp-transport.js`

// TODO: Transport imports are hacky; find a better workaround
const transportExists = fs.existsSync(gcpTransportPath)

export const logger = pino({
  messageKey: 'message',
  level: isProd ? 'info' : 'trace',
  timestamp: () => getGcpLoggingTimestamp(),
  // Add the Sentry trace ID to the log context
  mixin(_obj, _level, mixinLogger) {
    try {
      // Check if the logger already has a traceId in its bindings
      const currentBindings = mixinLogger.bindings()
      if (
        currentBindings &&
        typeof currentBindings === 'object' &&
        'traceId' in currentBindings &&
        currentBindings.traceId
      ) {
        // If traceId already exists in bindings, use that
        const traceId = currentBindings.traceId
        return { traceId, meta: { traceId } }
      }

      // Otherwise, get the trace ID from Sentry
      const traceId = getTraceId()

      // Duplicate in the `meta` field
      return traceId ? { traceId, meta: { traceId } } : {}
    } catch (err) {
      Sentry.captureException(err)
      return {}
    }
  },
  formatters: {
    level: pinoLevelToGcpSeverity,
    log: (entry: Record<string, unknown>) => formatGcpLogObject(entry)
  },
  transport:
    isDev && !isBrowser && transportExists
      ? { target: gcpTransportPath }
      : undefined,
  hooks: {
    logMethod(args, method, level) {
      // Only capture errors if the log level is at least 50 (error)
      if (level >= 50) {
        let foundError: Error | undefined
        const arg0 = args[0] as unknown
        const arg1 = args[1] as unknown

        for (const arg of [arg0, arg1]) {
          if (arg instanceof Error) {
            foundError = arg
          } else if (arg && typeof arg === 'object') {
            if ('err' in arg && arg.err instanceof Error) {
              foundError = arg.err
            }

            if ('error' in arg && arg.error instanceof Error) {
              foundError = arg.error
            }
          }

          if (foundError) {
            break
          }
        }

        if (foundError) {
          Sentry.captureException(foundError)
        }
      }

      return method.apply(this, args)
    }
  }
})

// TODO: Add more groups
export type LogGroup = 'api'

/** Standardized way to extend the logger with helpful info */
export function extendedLogger({
  logger: baseLogger = logger,
  ...args
}: {
  group: LogGroup
  name: string
  /** A more specific subtype of the name */
  nameSubtype?: string
  /** The eventId to add to the logger */
  eventId?: string
  logger?: Logger
}): Logger {
  const { group, name, nameSubtype } = args
  return baseLogger.child(args, {
    msgPrefix: `[${group}:${name}${nameSubtype ? `:${nameSubtype}` : ''}] `
  })
}

export type { Logger } from 'pino'
