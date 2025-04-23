export class HttpError extends Error {
  readonly statusCode: number

  constructor({
    statusCode = 500,
    message
  }: {
    statusCode?: number
    message: string
  }) {
    super(message)

    this.statusCode = statusCode
  }
}
