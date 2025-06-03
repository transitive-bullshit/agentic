import { hashObject, HttpError } from '@agentic/platform-core'
import { betterAjvErrors } from '@apideck/better-ajv-errors'
import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import fastUri from 'fast-uri'

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

// NOTE: Ajv is not compatible with Cloudflare Workers.
// @see https://github.com/ajv-validator/ajv/issues/2318

export function validateJsonSchema<
  T extends Record<string, unknown> = Record<string, unknown>
>({
  schema,
  data,
  ajv = globalAjv,
  errorMessage
}: {
  schema: any
  data: unknown
  ajv?: Ajv
  errorMessage?: string
}): T {
  const schemaHashKey = hashObject(schema)
  let validate = ajv.getSchema(schemaHashKey) as ValidateFunction<T>
  if (!validate) {
    validate = ajv.compile<T>(schema)
    ajv.addSchema(schema, schemaHashKey)
  }

  // TODO: Add better error messages
  if (ajv.validate(schema, data)) {
    return data as T
  }

  const errors = betterAjvErrors({ schema, data, errors: ajv.errors })
  const finalErrorMessage = [
    errorMessage,
    ...errors.map((error) => JSON.stringify(error, null, 2))
  ]
    .filter(Boolean)
    .join('\n')

  throw new HttpError({
    statusCode: 400,
    message: finalErrorMessage
  })
}
