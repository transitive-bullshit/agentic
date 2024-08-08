import type { z } from 'zod'

import type * as types from './types'
import { parseStructuredOutput } from './parse-structured-output'
import { stringifyForModel } from './utils'
import { zodToJsonSchema } from './zod-to-json-schema'

/**
 * Used to mark schemas so we can support both Zod and custom schemas.
 */
export const schemaSymbol = Symbol('agentic.schema')

export type Schema<TData = unknown> = {
  /**
   * The JSON Schema.
   */
  readonly jsonSchema: types.JSONSchema

  /**
   * Parses the value, validates that it matches this schema, and returns a
   * typed version of the value if it does. Throw an error if the value does
   * not match the schema.
   */
  readonly parse: types.ParseFn<TData>

  /**
   * Parses the value, validates that it matches this schema, and returns a
   * typed version of the value if it does. Returns an error message if the
   * value does not match the schema, and will never throw an error.
   */
  readonly safeParse: types.SafeParseFn<TData>

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
    'parse' in value
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
    parse = (value) => value as TData,
    safeParse
  }: {
    parse?: types.ParseFn<TData>
    safeParse?: types.SafeParseFn<TData>
  } = {}
): Schema<TData> {
  safeParse ??= (value: unknown) => {
    try {
      const result = parse(value)
      return { success: true, data: result }
    } catch (err: any) {
      return { success: false, error: err.message ?? String(err) }
    }
  }

  return {
    [schemaSymbol]: true,
    _type: undefined as TData,
    jsonSchema,
    parse,
    safeParse
  }
}

export function createSchemaFromZodSchema<TData>(
  zodSchema: z.Schema<TData>,
  opts: { strict?: boolean } = {}
): Schema<TData> {
  return createSchema(zodToJsonSchema(zodSchema, opts), {
    parse: (value) => {
      return parseStructuredOutput(value, zodSchema)
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
