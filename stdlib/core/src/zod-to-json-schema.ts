import type { z } from 'zod'
import { zodToJsonSchema as zodToJsonSchemaImpl } from 'openai-zod-to-json-schema'

import type * as types from './types'
import { omit } from './utils'

/** Generate a JSON Schema from a Zod schema. */
export function zodToJsonSchema(
  schema: z.ZodType,
  {
    strict = false
  }: {
    strict?: boolean
  } = {}
): types.JSONSchema {
  return omit(
    zodToJsonSchemaImpl(schema, {
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
