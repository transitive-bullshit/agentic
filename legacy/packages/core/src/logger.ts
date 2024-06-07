import { cyan, green, magenta, red, yellow } from 'colorette'
import logger from 'debug'

import { SPACE } from '@/constants'
import { identity } from '@/utils'

import { getEnv } from './env'

/**
 * Severity levels of an event.
 */
export enum Severity {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4
}

/**
 * Strings to represent severity levels.
 */
const SEVERITY_STRINGS: Record<Severity, string> = {
  [Severity.DEBUG]: 'DEBUG',
  [Severity.INFO]: 'INFO',
  [Severity.WARNING]: 'WARN',
  [Severity.ERROR]: 'ERROR',
  [Severity.CRITICAL]: 'CRITICAL'
}

/**
 * Functions to colorize text based on severity level.
 */
const SEVERITY_COLORS: Record<Severity, (text: string) => string> = {
  [Severity.DEBUG]: cyan,
  [Severity.INFO]: green,
  [Severity.WARNING]: yellow,
  [Severity.ERROR]: red,
  [Severity.CRITICAL]: magenta
}

/*
 * Define minimum LOG_LEVEL, defaulting to Severity.INFO if not provided or if an invalid value is provided. Any events below that level won't be logged to the console.
 */
const logLevelEnv = getEnv(
  'LOG_LEVEL',
  'info'
)?.toUpperCase() as keyof typeof Severity
let LOG_LEVEL = Severity[logLevelEnv]
const showDateTime = getEnv('LOG_SHOW_DATE') === 'true'

if (LOG_LEVEL === undefined) {
  console.error(
    `Invalid value for LOG_LEVEL: ${logLevelEnv}. Falling back to default level: INFO`
  )
  LOG_LEVEL = Severity.INFO
}

const debug = logger('agentic')

const INDENT = SPACE.repeat(23)

// Override the default logger to add a timestamp and severity level to the logged arguments:
logger.formatArgs = function formatArgs(args) {
  const severity = args[args.length - 1]
  const name = this.namespace
  const dateTime = showDateTime ? new Date().toISOString() + SPACE : ''
  const colorFn = SEVERITY_COLORS[severity] || identity
  const prefix = colorFn(SPACE + SEVERITY_STRINGS[severity] + SPACE)
  args[0] =
    dateTime + name + prefix + args[0].split('\n').join('\n' + INDENT + prefix)

  // Remove the severity level from the logged arguments:
  args.pop()
}

/**
 * Default `debug` logger with methods that log to the console with the respective severity level.
 */
export const defaultLogger = {
  /**
   * Debug-level logs, providing detailed information for development and debugging.
   *
   * @param formatter - formatter to structure the log message
   * @param args - arguments to be logged
   */
  debug: (formatter: any, ...args: any[]) => {
    if (LOG_LEVEL > Severity.DEBUG) return
    debug(formatter, ...args, Severity.DEBUG)
  },

  /**
   * Info-level logs, indicating that the system is functioning normally.
   *
   * @param formatter - formatter to structure the log message
   * @param args - arguments to be logged
   */
  info: (formatter: any, ...args: any[]) => {
    if (LOG_LEVEL > Severity.INFO) return
    debug(formatter, ...args, Severity.INFO)
  },

  /**
   * Warning-level logs, indicating that the system encountered unexpected events or behavior.
   *
   * @param formatter - formatter to structure the log message
   * @param args - arguments to be logged
   */
  warn: (formatter: any, ...args: any[]) => {
    if (LOG_LEVEL > Severity.WARNING) return
    debug(formatter, ...args, Severity.WARNING)
  },

  /**
   * Error-level logs, indicating that the system encountered errors.
   *
   * @param formatter - formatter to structure the log message
   * @param args - arguments to be logged
   */
  error: (formatter: any, ...args: any[]) => {
    if (LOG_LEVEL > Severity.ERROR) return
    debug(formatter, ...args, Severity.ERROR)
  },

  /**
   * Critical-level logs, indicating that the system encountered errors and might not be able to function properly.
   *
   * @param formatter - formatter to structure the log message
   * @param args - arguments to be logged
   */
  critical: (formatter: any, ...args: any[]) => {
    if (LOG_LEVEL > Severity.CRITICAL) return
    debug(formatter, ...args, Severity.CRITICAL)
  }
}

/**
 * Logger type with methods for logging at various levels of severity.
 */
export type Logger = typeof defaultLogger
