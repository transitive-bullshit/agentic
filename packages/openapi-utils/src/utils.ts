import type { OpenAPIOperationParameterSource } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import camelCaseImpl from 'camelcase'

import type { ObjectSubtype, SchemaObject } from './types'

export function camelCase(identifier: string): string {
  return camelCaseImpl(identifier)
}

export function mergeJsonSchemaObjects(
  schema0: SchemaObject & ObjectSubtype,
  schema1: SchemaObject,
  {
    source,
    sources,
    label
  }: {
    source: OpenAPIOperationParameterSource
    sources: Record<string, OpenAPIOperationParameterSource>
    label: string
  }
) {
  // TODO: Support cookie parameters
  assert(
    source !== 'cookie',
    'Cookie parameters for OpenAPI operations are not yet supported. If you need cookie parameter support, please contact support@agentic.so.'
  )

  if (schema1.type === 'object' && schema1.properties) {
    schema0.properties = {
      ...schema0.properties,
      ...schema1.properties
    }

    for (const key of Object.keys(schema1.properties)) {
      assert(
        !sources[key],
        `Duplicate parameter "${key}" in OpenAPI spec ${label}`
      )

      sources[key] = source
    }
  }

  if (schema1.required) {
    schema0.required = Array.from(
      new Set([...(schema0.required || []), ...schema1.required])
    )
  }

  // https://community.openai.com/t/official-documentation-for-supported-schemas-for-response-format-parameter-in-calls-to-client-beta-chats-completions-parse/932422/3
  // https://platform.openai.com/docs/guides/structured-outputs
  // https://json-schema.org/understanding-json-schema/reference/combining
  assert(
    !schema1.oneOf,
    `JSON schema "oneOf" is not supported in OpenAPI spec ${label}`
  )
  assert(
    !schema1.allOf,
    `JSON schema "oneOf" is not supported in OpenAPI spec ${label}`
  )
  // TODO: Support "anyOf" which should be supported by OpenAI function calling
  assert(
    !schema1.anyOf,
    `JSON schema "anyOf" is not supported in OpenAPI spec ${label}`
  )
}
