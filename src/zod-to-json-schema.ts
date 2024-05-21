import type { z } from 'zod'
import { zodToJsonSchema as zodToJsonSchemaImpl } from 'zod-to-json-schema'

import { omit } from './utils.js'

/** Generate a JSON Schema from a Zod schema. */
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  return omit(
    zodToJsonSchemaImpl(schema, { $refStrategy: 'none' }),
    '$schema',
    'default',
    'definitions',
    'description',
    'markdownDescription',
    'additionalProperties'
  )
}
