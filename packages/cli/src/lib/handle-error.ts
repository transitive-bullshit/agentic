import { gracefulExit } from 'exit-hook'
import { HTTPError } from 'ky'

import type { Context } from '../types'

export function createErrorHandler(ctx: Omit<Context, 'handleError'>) {
  return async function handleError(error: any) {
    let message: string | undefined
    let details: Error | undefined

    if (typeof error === 'string') {
      message = error
    } else if (error instanceof Error) {
      details = error
      message = error.message

      if (error instanceof HTTPError) {
        if (error.response) {
          try {
            message = error.response.statusText

            const body = await error.response.json()
            if (body.error && typeof body.error === 'string') {
              message = JSON.stringify(
                {
                  ...body,
                  details: error.toString()
                },
                null,
                2
              )
              details = undefined
            }
          } catch {
            // TODO
          }
        }
      }
    }

    ctx.logger.error([message, details].filter(Boolean).join('\n'))
    gracefulExit(1)
  }
}
