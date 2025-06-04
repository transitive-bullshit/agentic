import { Validator } from '@agentic/json-schema'
import { HttpError } from '@agentic/platform-core'
import plur from 'plur'

/**
 * Validates `data` against the provided JSON schema object.
 *
 * This method uses a fork of `@cfworker/json-schema`. It does not use `ajv`
 * because `ajv` is not supported on CF workers due to its dynamic code
 * generation and evaluation.
 *
 * If you want a stricter version of this method which uses `ajv` and you're
 * not running on CF workers, consider using `validateJsonSchemaObject` from
 * `@agentic/platform-openapi-utils`.
 */
export function cfValidateJsonSchemaObject<
  T extends Record<string, unknown> = Record<string, unknown>
>({
  schema,
  data,
  errorMessage,
  coerce = true
}: {
  schema: any
  data: Record<string, unknown>
  errorMessage?: string
  coerce?: boolean
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

  const validator = new Validator({ schema, coerce })
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
