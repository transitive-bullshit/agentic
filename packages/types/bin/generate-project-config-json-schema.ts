import restoreCursor from 'restore-cursor'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { agenticProjectConfigSchema } from '../src'

async function main() {
  restoreCursor()

  const tempJsonSchema = zodToJsonSchema(agenticProjectConfigSchema)

  const publicJsonSchema = {
    ...tempJsonSchema,
    $schema: 'https://json-schema.org/draft-07/schema',
    // TODO
    // $id: 'https://agentic.so/docs/schema.json',
    title: 'Agentic Project Config Schema',
    description:
      'JSON Schema used by `agentic.config.{ts,js,json}` files to configure Agentic projects.'
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(publicJsonSchema, null, 2))
}

await main()
