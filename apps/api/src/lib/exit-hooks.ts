import { promisify } from 'node:util'

import type { ServerType } from '@hono/node-server'
import * as Sentry from '@sentry/node'
import { asyncExitHook } from 'exit-hook'
import restoreCursor from 'restore-cursor'

import { db } from '@/db'

export function initExitHooks({
  server,
  timeoutMs = 10_000
}: {
  server: ServerType
  timeoutMs?: number
}) {
  // Gracefully restore the cursor if run from a TTY
  restoreCursor()

  // Gracefully shutdown the HTTP server
  asyncExitHook(
    async function shutdownServerExitHook() {
      try {
        await promisify(server.close)()
      } catch {
        // TODO
      }
    },
    {
      wait: timeoutMs
    }
  )

  // Gracefully shutdown the postgres database connection
  asyncExitHook(
    async function shutdownDbExitHook() {
      try {
        if ('end' in db.$client) {
          await db.$client.end({ timeout: timeoutMs })
        }
      } catch {
        // TODO
      }
    },
    {
      wait: timeoutMs
    }
  )

  // Gracefully flush Sentry events
  asyncExitHook(
    async function flushSentryExitHook() {
      await Sentry.flush(timeoutMs)
    },
    {
      wait: timeoutMs
    }
  )

  // TODO: On Node.js, log unhandledRejection, uncaughtException, and warning events
}
