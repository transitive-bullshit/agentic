import { assert } from '@agentic/platform-core'
import * as Sentry from '@sentry/node'
import { z } from 'zod'

import type { Environment, Service } from '@/lib/types'
import { env } from '@/lib/env'

import { getTraceId } from './utils'

export interface Logger {
  trace(message?: any, ...detail: any[]): void
  debug(message?: any, ...detail: any[]): void
  info(message?: any, ...detail: any[]): void
  warn(message?: any, ...detail: any[]): void
  error(message?: any, ...detail: any[]): void
}

const rawLogLevels = ['trace', 'debug', 'info', 'warn', 'error'] as const
export const logLevelsSchema = z.enum(rawLogLevels)
export type LogLevel = z.infer<typeof logLevelsSchema>

export const logLevelsMap = rawLogLevels.reduce(
  (acc, level, index) => {
    acc[level] = index
    return acc
  },
  {} as Record<LogLevel, number>
)

export class ConsoleLogger implements Logger {
  protected readonly environment: Environment
  protected readonly service: Service
  protected readonly requestId: string
  protected readonly metadata: Record<string, unknown>
  protected readonly console: Console
  protected readonly logLevel: LogLevel

  constructor({
    requestId,
    service,
    environment = env.NODE_ENV,
    metadata = {},
    console = globalThis.console,
    logLevel = env.LOG_LEVEL
  }: {
    requestId: string
    service: Service
    environment?: Environment
    metadata?: Record<string, unknown>
    console?: Console
    logLevel?: LogLevel
  }) {
    assert(console, 500, '`console` is required for Logger')

    this.requestId = requestId
    this.service = service
    this.environment = environment
    this.metadata = metadata
    this.console = console
    this.logLevel = logLevel
  }

  trace(message?: any, ...detail: any[]) {
    if (logLevelsMap[this.logLevel] > logLevelsMap.trace) {
      return
    }

    if (this.environment === 'development') {
      this.console.trace(message, ...detail)
    } else {
      this.console.trace(this._marshal('trace', message, ...detail))
    }
  }

  debug(message?: any, ...detail: any[]) {
    if (logLevelsMap[this.logLevel] > logLevelsMap.debug) {
      return
    }

    if (this.environment === 'development') {
      this.console.debug(message, ...detail)
    } else {
      this.console.debug(this._marshal('debug', message, ...detail))
    }
  }

  info(message?: any, ...detail: any[]) {
    if (logLevelsMap[this.logLevel] > logLevelsMap.info) {
      return
    }

    if (this.environment === 'development') {
      this.console.info(message, ...detail)
    } else {
      this.console.info(this._marshal('info', message, ...detail))
    }
  }

  warn(message?: any, ...detail: any[]) {
    if (logLevelsMap[this.logLevel] > logLevelsMap.warn) {
      return
    }

    if (this.environment === 'development') {
      this.console.warn(message, ...detail)
    } else {
      this.console.warn(this._marshal('warn', message, ...detail))
    }
  }

  error(message?: any, ...detail: any[]) {
    if (logLevelsMap[this.logLevel] > logLevelsMap.error) {
      return
    }

    if (this.environment === 'development') {
      this.console.error(message, ...detail)
    } else {
      this.console.error(this._marshal('error', message, ...detail))
    }
  }

  protected _marshal(level: LogLevel, message?: any, ...detail: any[]): string {
    const log = {
      type: 'log',
      level,
      message,
      detail,
      time: Date.now(),
      env: this.environment,
      service: this.service,
      requestId: this.requestId,
      traceId: getTraceId(),
      metadata: this.metadata
    }

    if (level === 'error') {
      let foundError: Error | undefined
      for (const arg of detail) {
        if (!arg) {
          continue
        }

        if (arg instanceof Error) {
          foundError = arg
          break
        }

        if (typeof arg !== 'object') {
          continue
        }

        if ('err' in arg && arg.err instanceof Error) {
          foundError = arg.err
          break
        }

        if ('error' in arg && arg.error instanceof Error) {
          foundError = arg.error
          break
        }
      }

      if (foundError) {
        Sentry.captureException(foundError)
      }
    }

    return JSON.stringify(log, null, this.environment === 'development' ? 2 : 0)
  }
}
