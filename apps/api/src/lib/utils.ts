import { createHash, randomUUID } from 'node:crypto'

import { HttpError } from './errors'

export function sha256(input: string = randomUUID()) {
  return createHash('sha256').update(input).digest('hex')
}

export function assert(expr: unknown, message?: string): asserts expr
export function assert(
  expr: unknown,
  statusCode?: number,
  message?: string
): asserts expr
export function assert(
  expr: unknown,
  statusCodeOrMessage?: number | string,
  message = 'Internal assertion failed'
): asserts expr {
  if (expr) {
    return
  }

  if (typeof statusCodeOrMessage === 'number') {
    throw new HttpError({ statusCode: statusCodeOrMessage, message })
  } else {
    throw new Error(statusCodeOrMessage ?? message)
  }
}
