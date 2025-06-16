import { HTTPError } from 'ky'
import { toast as toastImpl } from 'sonner'

export function toast(message: string) {
  toastImpl(message)
}

export async function toastError(
  error: any,
  ctx: {
    label?: string
  }
) {
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
          if (typeof body.error === 'string') {
            message = body.error
          }
        } catch {
          // TODO
        }
      }
    }
  }

  console.error(ctx.label, message, ...[details].filter(Boolean))
  toastImpl.error(message)
}
