import { cyan, green, magenta, red, yellow } from 'colorette'
import logger from 'debug'

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
let LOG_LEVEL = Severity.INFO

const logLevelEnv =
  Severity[getEnv('LOG_LEVEL')?.toUpperCase() as keyof typeof Severity]
const showDateTime = getEnv('LOG_SHOW_DATE') === 'true'

if (logLevelEnv !== undefined) {
  LOG_LEVEL = logLevelEnv
} else if (getEnv('LOG_LEVEL')) {
  console.error(
    `Invalid value for LOG_LEVEL: ${getEnv(
      'LOG_LEVEL'
    )}. Falling back to default level: INFO`
  )
}

const debug = logger('agentic')

const SPACE = ' '
const INDENT = SPACE.repeat(23)

// Override the default logger to add a timestamp and severity level to the logged arguments:
logger.formatArgs = function formatArgs(args) {
  const severity = args[args.length - 1]
  const name = this.namespace
  const dateTime = showDateTime ? new Date().toISOString() : ''
  const colorFn = SEVERITY_COLORS[severity] || identity
  const prefix = colorFn(SPACE + name + SPACE)
  args[0] = dateTime + prefix + args[0].split('\n').join('\n' + INDENT + prefix)
  // args.push('+' + logger.humanize(this.diff));

  // Remove the severity level from the logged arguments:
  args.pop()
}

export const defaultLogger = {
  debug: (message: string, ...args: any[]) => {
    if (LOG_LEVEL > Severity.DEBUG) return
    debug(message, ...args, Severity.DEBUG)
  },
  info: (message: string, ...args: any[]) => {
    if (LOG_LEVEL > Severity.INFO) return
    debug(message, ...args, Severity.INFO)
  },
  warning: (message: string, ...args: any[]) => {
    if (LOG_LEVEL > Severity.WARNING) return
    debug(message, ...args, Severity.WARNING)
  },
  error: (message: string, ...args: any[]) => {
    if (LOG_LEVEL > Severity.ERROR) return
    debug(message, ...args, Severity.ERROR)
  },
  critical: (message: string, ...args: any[]) => {
    if (LOG_LEVEL > Severity.CRITICAL) return
    debug(message, ...args, Severity.CRITICAL)
  }
}
