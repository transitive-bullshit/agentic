import { assert, hashObject, HttpError } from '@agentic/platform-core'
import { betterAjvErrors } from '@apideck/better-ajv-errors'
import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import fastUri from 'fast-uri'
import plur from 'plur'

const globalAjv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
  removeAdditional: true,
  uriResolver: fastUri,
  // Explicitly set allErrors to `false`.
  // When set to `true`, a DoS attack is possible.
  allErrors: false
})

// https://github.com/ajv-validator/ajv-formats
addFormats(globalAjv)

/**
 * Validates `data` against the provided JSON schema.
 *
 * This method uses `ajv` and is therefore not compatible with CF workers due
 * to its use of code generation and evaluation.
 *
 * The API gateway uses `cfValidateJsonSchemaObject`, which is looser but
 * special-cased for CF workers.
 *
 * @see https://github.com/ajv-validator/ajv/issues/2318
 */
export async function validateJsonSchema<T = unknown>({
  schema,
  data,
  ajv = globalAjv,
  errorMessage
}: {
  schema: any
  data: unknown
  ajv?: Ajv
  errorMessage?: string
}): Promise<T> {
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
        statusCode: 400,
        message: `${errorMessage ? errorMessage + ': ' : ''}Missing required ${plur('field', missingRequiredFields.length)}: ${missingRequiredFields.map((field) => `"${field}"`).join(', ')}`
      })
    }
  }

  const schemaHashKey = await hashObject(schema)
  let validate = ajv.getSchema(schemaHashKey) as ValidateFunction<T>
  if (!validate) {
    validate = ajv.compile<T>(schema)
    ajv.addSchema(schema, schemaHashKey)
  }

  if (ajv.validate(schema, data)) {
    return data as T
  }

  // TODO: Add better error messages
  const errors = betterAjvErrors({ schema, data, errors: ajv.errors })
  const finalErrorMessage = [
    errorMessage ? `${errorMessage}: ` : undefined,
    ...errors.map((error) => JSON.stringify(error, null, 2))
  ]
    .filter(Boolean)
    .join('\n')

  throw new HttpError({
    statusCode: 400,
    message: finalErrorMessage
  })
}
