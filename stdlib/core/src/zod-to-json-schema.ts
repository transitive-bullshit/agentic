import type * as z3 from 'zod/v3'
import { zodToJsonSchema as zodToJsonSchemaImpl } from 'openai-zod-to-json-schema'
import * as z4 from 'zod/v4/core'

import type * as types from './types'
import { omit } from './utils'

/** Generate a JSON Schema from a Zod schema. */
export function zodToJsonSchema(
  schema: z3.ZodType | z4.$ZodType,
  {
    strict = false
  }: {
    strict?: boolean
  } = {}
): types.JSONSchema {
  if ('_zod' in schema) {
    return z4.toJSONSchema(schema, {
      unrepresentable: 'any'
    })
  } else {
    return omit(
      // TODO: types
      zodToJsonSchemaImpl(schema as any, {
        $refStrategy: 'none',
        openaiStrictMode: strict
      }),
      '$schema',
      'default',
      'definitions',
      'description',
      'markdownDescription'
    )
  }
}
