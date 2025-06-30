import type { ServerType } from '@hono/node-server'
import restoreCursor from 'restore-cursor'

export function initExitHooks({ server }: { server: ServerType }) {
  // Gracefully restore the cursor if run from a TTY
  restoreCursor()

  process.on('SIGINT', () => {
    server.close()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    server.close((err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      process.exit(0)
    })
  })
}
