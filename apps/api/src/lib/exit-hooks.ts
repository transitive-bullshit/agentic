import { promisify } from 'node:util'

import type { ServerType } from '@hono/node-server'
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
      await promisify(server.close)()
    },
    {
      wait: timeoutMs
    }
  )

  // Gracefully shutdown the postgres database connection
  asyncExitHook(
    async function shutdownDbExitHook() {
      await db.$client.end({
        timeout: timeoutMs
      })
    },
    {
      wait: timeoutMs
    }
  )

  // TODO: On Node.js, log unhandledRejection, uncaughtException, and warning events
}
