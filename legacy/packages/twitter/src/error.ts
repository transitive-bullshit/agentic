export type TwitterErrorType =
  | 'twitter:forbidden'
  | 'twitter:auth'
  | 'twitter:rate-limit'
  | 'twitter:unknown'
  | 'network'

export class TwitterError extends Error {
  type: TwitterErrorType
  isFinal: boolean
  status?: number

  constructor(
    message: string,
    {
      type,
      isFinal = false,
      status,
      ...opts
    }: ErrorOptions & {
      type: TwitterErrorType
      isFinal?: boolean
      status?: number
    }
  ) {
    super(message, opts)

    this.type = type
    this.isFinal = isFinal
    this.status = status ?? (opts.cause as any)?.status
  }
}
