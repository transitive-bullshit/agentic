import type { z } from 'zod'

import type * as types from './types'
import { safeParseStructuredOutput } from './parse-structured-output'
import { stringifyForModel } from './utils'
import { zodToJsonSchema } from './zod-to-json-schema'

/**
 * Used to mark schemas so we can support both Zod and custom schemas.
 */
export const schemaSymbol = Symbol('agentic.schema')
export const validatorSymbol = Symbol('agentic.validator')

export type Schema<TData = unknown> = {
  /**
   * The JSON Schema.
   */
  readonly jsonSchema: types.JSONSchema

  /**
   * Optional. Validates that the structure of a value matches this schema,
   * and returns a typed version of the value if it does.
   */
  readonly validate?: types.ValidatorFn<TData>

  /**
   * Used to mark schemas so we can support both Zod and custom schemas.
   */
  [schemaSymbol]: true

  /**
   * Schema type for inference.
   */
  _type: TData
}

export function isSchema(value: unknown): value is Schema {
  return (
    typeof value === 'object' &&
    value !== null &&
    schemaSymbol in value &&
    value[schemaSymbol] === true &&
    'jsonSchema' in value &&
    'validate' in value
  )
}

export function isZodSchema(value: unknown): value is z.ZodType {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_type' in value &&
    '_output' in value &&
    '_input' in value &&
    '_def' in value &&
    'parse' in value &&
    'safeParse' in value
  )
}

export function asSchema<TData>(
  schema: z.Schema<TData> | Schema<TData>,
  opts: { strict?: boolean } = {}
): Schema<TData> {
  return isSchema(schema) ? schema : createSchemaFromZodSchema(schema, opts)
}

/**
 * Create a schema from a JSON Schema.
 */
export function createSchema<TData = unknown>(
  jsonSchema: types.JSONSchema,
  {
    validate
  }: {
    validate?: types.ValidatorFn<TData>
  } = {}
): Schema<TData> {
  return {
    [schemaSymbol]: true,
    _type: undefined as TData,
    jsonSchema,
    validate
  }
}

export function createSchemaFromZodSchema<TData>(
  zodSchema: z.Schema<TData>,
  opts: { strict?: boolean } = {}
): Schema<TData> {
  return createSchema(zodToJsonSchema(zodSchema, opts), {
    validate: (value) => {
      return safeParseStructuredOutput(value, zodSchema)
    }
  })
}

const DEFAULT_SCHEMA_PREFIX = `
---

Respond with JSON using the following JSON schema:

\`\`\`json`
const DEFAULT_SCHEMA_SUFFIX = '```'

export function augmentSystemMessageWithJsonSchema({
  schema,
  system,
  schemaPrefix = DEFAULT_SCHEMA_PREFIX,
  schemaSuffix = DEFAULT_SCHEMA_SUFFIX
}: {
  schema: types.JSONSchema
  system?: string
  schemaPrefix?: string
  schemaSuffix?: string
}): string {
  return [system, schemaPrefix, stringifyForModel(schema), schemaSuffix]
    .filter(Boolean)
    .join('\n')
    .trim()
}
