import { HttpError } from '@agentic/platform-core'
import { Validator } from '@cfworker/json-schema'

export function validateJsonSchema<
  T extends Record<string, unknown> = Record<string, unknown>
>({
  schema,
  data,
  errorMessage
}: {
  schema: any
  data: unknown
  errorMessage?: string
}): T {
  const validator = new Validator(schema)

  const result = validator.validate(data)
  if (result.valid) {
    return data as T
  }

  const finalErrorMessage = [
    errorMessage,
    ...result.errors.map((error) => JSON.stringify(error, null, 2))
  ]
    .filter(Boolean)
    .join('\n')

  throw new HttpError({
    statusCode: 400,
    message: finalErrorMessage
  })
}
