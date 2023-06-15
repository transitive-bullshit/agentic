import * as pino from 'pino'
import pretty from 'pino-pretty'

export const defaultLogger = pino.pino(
  {
    level: process.env.LOG_LEVEL || 'info'
  },
  pretty({
    sync: true,
    colorize: true
  })
)
