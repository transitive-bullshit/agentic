import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class HttpError extends Error {
  readonly statusCode: ContentfulStatusCode

  constructor({
    statusCode = 500,
    message
  }: {
    statusCode?: ContentfulStatusCode
    message: string
  }) {
    super(message)

    this.statusCode = statusCode
  }
}
