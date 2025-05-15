import { createHash, randomUUID } from 'node:crypto'

import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ZodSchema, ZodTypeDef } from 'zod'

import { HttpError, ZodValidationError } from './errors'

export function sha256(input: string = randomUUID()) {
  return createHash('sha256').update(input).digest('hex')
}

export function assert(expr: unknown, message?: string): asserts expr
export function assert(
  expr: unknown,
  statusCode?: ContentfulStatusCode,
  message?: string
): asserts expr
export function assert(
  expr: unknown,
  statusCodeOrMessage?: ContentfulStatusCode | string,
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

export function parseZodSchema<
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
>(
  schema: ZodSchema<Output, Def, Input>,
  input: unknown,
  {
    error
  }: {
    error?: string
  } = {}
): Output {
  try {
    return schema.parse(input)
  } catch (err) {
    throw new ZodValidationError({
      prefix: error,
      cause: err
    })
  }
}
