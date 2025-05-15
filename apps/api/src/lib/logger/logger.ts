import * as Sentry from '@sentry/node'

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

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'

export class ConsoleLogger implements Logger {
  protected readonly environment: Environment
  protected readonly service: Service
  protected readonly requestId: string
  protected readonly metadata: Record<string, unknown>
  protected readonly console: Console

  constructor({
    requestId,
    service,
    environment = env.NODE_ENV,
    metadata = {},
    console = globalThis.console
  }: {
    requestId: string
    service: Service
    environment?: Environment
    metadata?: Record<string, unknown>
    console?: Console
  }) {
    this.requestId = requestId
    this.service = service
    this.environment = environment
    this.metadata = metadata
    this.console = console
  }

  trace(message?: any, ...detail: any[]) {
    this.console.trace(this._marshal('trace', message, ...detail))
  }

  debug(message?: any, ...detail: any[]) {
    this.console.debug(this._marshal('debug', message, ...detail))
  }

  info(message?: any, ...detail: any[]) {
    this.console.info(this._marshal('info', message, ...detail))
  }

  warn(message?: any, ...detail: any[]) {
    this.console.warn(this._marshal('warn', message, ...detail))
  }

  error(message?: any, ...detail: any[]) {
    this.console.error(this._marshal('error', message, ...detail))
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
