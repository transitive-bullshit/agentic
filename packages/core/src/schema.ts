import type { z } from 'zod'

import type * as types from './types'
import { parseStructuredOutput } from './parse-structured-output'
import { stringifyForModel } from './utils'
import { zodToJsonSchema } from './zod-to-json-schema'

/**
 * Used to mark schemas so we can support both Zod and custom schemas.
 */
export const schemaSymbol = Symbol('agentic.schema')

/**
 * Structured schema used across Agentic, which wraps either a Zod schema or a
 * JSON Schema.
 *
 * JSON Schema support is important to support more dynamic tool sources such as
 * MCP.
 */
export type AgenticSchema<TData = unknown> = {
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

  /**
   * Source Zod schema if this object was created from a Zod schema.
   */
  _source?: any
}

export function isAgenticSchema(value: unknown): value is AgenticSchema {
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
    !!value &&
    typeof value === 'object' &&
    '_def' in value &&
    '~standard' in value &&
    (value['~standard'] as any)?.vendor === 'zod'
  )
}

export function asAgenticSchema<TData>(
  schema: z.Schema<TData> | AgenticSchema<TData>,
  opts: { strict?: boolean } = {}
): AgenticSchema<TData> {
  return isAgenticSchema(schema)
    ? schema
    : createAgenticSchemaFromZodSchema(schema, opts)
}

export function asZodOrJsonSchema<TData>(
  schema: z.Schema<TData> | AgenticSchema<TData>
): z.Schema<TData> | types.JSONSchema {
  return isZodSchema(schema) ? schema : schema.jsonSchema
}

/**
 * Create an AgenticSchema from a JSON Schema.
 *
 * All `AIFunction` input schemas accept either a Zod schema or a custom JSON
 * Schema. Use this function to wrap JSON schemas for use with `AIFunction`.
 *
 * Note that JSON Schemas are not validated by default, so you have to pass
 * in an optional `parse` function (using `ajv`, for instance) if you'd like to
 * validate them at runtime.
 */
export function createJsonSchema<TData = unknown>(
  jsonSchema: types.JSONSchema,
  {
    parse = (value) => value as TData,
    safeParse,
    source
  }: {
    parse?: types.ParseFn<TData>
    safeParse?: types.SafeParseFn<TData>
    source?: any
  } = {}
): AgenticSchema<TData> {
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
    safeParse,
    _source: source
  }
}

export function createAgenticSchemaFromZodSchema<TData>(
  zodSchema: z.Schema<TData>,
  opts: { strict?: boolean } = {}
): AgenticSchema<TData> {
  return createJsonSchema(zodToJsonSchema(zodSchema, opts), {
    parse: (value) => {
      return parseStructuredOutput(value, zodSchema)
    },
    source: zodSchema
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
