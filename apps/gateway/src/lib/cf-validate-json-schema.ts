import { Validator } from '@agentic/json-schema'
import { assert, HttpError } from '@agentic/platform-core'
import plur from 'plur'

/**
 * Validates `data` against the provided JSON schema.
 *
 * This method uses a fork of `@cfworker/json-schema`. It does not use `ajv`
 * because `ajv` is not supported on CF workers due to its dynamic code
 * generation and evaluation.
 *
 * If you want a stricter version of this method which uses `ajv` and you're
 * not running on CF workers, consider using `validateJsonSchemaObject` from
 * `@agentic/platform-openapi-utils`.
 */
export function cfValidateJsonSchema<T = unknown>({
  schema,
  data,
  coerce = false,
  strictAdditionalProperties = false,
  errorMessage,
  errorStatusCode = 400
}: {
  schema: any
  data: unknown
  coerce?: boolean
  strictAdditionalProperties?: boolean
  errorMessage?: string
  errorStatusCode?: number
}): T {
  assert(schema, 400, '`schema` is required')
  const isSchemaObject =
    typeof schema === 'object' &&
    !Array.isArray(schema) &&
    schema.type === 'object'
  const isDataObject = typeof data === 'object' && !Array.isArray(data)
  if (isSchemaObject && !isDataObject) {
    throw new HttpError({
      statusCode: 400,
      message: `${errorMessage ? errorMessage + ': ' : ''}Data must be an object according to its schema.`
    })
  }

  // Special-case check for required fields to give better error messages
  if (isSchemaObject && Array.isArray(schema.required)) {
    const missingRequiredFields: string[] = schema.required.filter(
      (field: string) => (data as Record<string, unknown>)[field] === undefined
    )

    if (missingRequiredFields.length > 0) {
      throw new HttpError({
        statusCode: errorStatusCode,
        message: `${errorMessage ? errorMessage + ': ' : ''}Missing required ${plur('parameter', missingRequiredFields.length)}: ${missingRequiredFields.map((field) => `"${field}"`).join(', ')}`
      })
    }
  }

  // Special-case check for additional top-level fields to give better error
  // messages.
  if (
    isSchemaObject &&
    schema.properties &&
    (schema.additionalProperties === false ||
      (schema.additionalProperties === undefined && strictAdditionalProperties))
  ) {
    const extraProperties = Object.keys(data as Record<string, unknown>).filter(
      (key) => !schema.properties[key]
    )

    if (extraProperties.length > 0) {
      throw new HttpError({
        statusCode: errorStatusCode,
        message: `${errorMessage ? errorMessage + ': ' : ''}Unexpected additional ${plur('parameter', extraProperties.length)}: ${extraProperties.map((property) => `"${property}"`).join(', ')}`
      })
    }
  }

  const validator = new Validator({
    schema,
    coerce,
    strictAdditionalProperties
  })
  const result = validator.validate(data)
  if (result.valid) {
    // console.log('validate', {
    //   schema,
    //   data,
    //   result: result.instance
    // })

    // Return the (possibly) coerced data
    return result.instance as T
  }

  const finalErrorMessage = `${
    errorMessage ? errorMessage + ': ' : ''
  }${result.errors
    .map(({ keyword, error }) => `keyword "${keyword}" error ${error}`)
    .join(' ')}`

  throw new HttpError({
    statusCode: errorStatusCode,
    message: finalErrorMessage
  })
}
