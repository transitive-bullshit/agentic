import restoreCursor from 'restore-cursor'

export function initExitHooks() {
  // Gracefully restore the cursor if run from a TTY
  restoreCursor()

  process.on('SIGINT', () => {
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    process.exit(0)
  })
}
