import { HttpError } from '@agentic/platform-core'
import { Validator } from '@cfworker/json-schema'
import plur from 'plur'

export function validateJsonSchemaObject<
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
  // Special-case check for required fields to give better error messages
  if (Array.isArray(schema.required)) {
    const missingRequiredFields: string[] = schema.required.filter(
      (field: string) => (data as T)[field] === undefined
    )

    if (missingRequiredFields.length > 0) {
      throw new HttpError({
        statusCode: 400,
        message: `${errorMessage ? errorMessage + ': ' : ''}Missing required ${plur('field', missingRequiredFields.length)}: ${missingRequiredFields.map((field) => `"${field}"`).join(', ')}`
      })
    }
  }

  const validator = new Validator(schema)

  const result = validator.validate(data)
  if (result.valid) {
    return data as T
  }

  const finalErrorMessage = `${
    errorMessage ? errorMessage + ': ' : ''
  }${result.errors
    .map(({ keyword, error }) => `keyword "${keyword}" error ${error}`)
    .join(' ')}`

  throw new HttpError({
    statusCode: 400,
    message: finalErrorMessage
  })
}
