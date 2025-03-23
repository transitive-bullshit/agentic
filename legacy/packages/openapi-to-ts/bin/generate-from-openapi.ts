/* eslint-disable no-template-curly-in-string */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { assert } from '@agentic/core'

import { generateTSFromOpenAPI } from '../src'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// TODO: Add proper CLI handling
async function main() {
  const pathToOpenApiSpec =
    process.argv[2] ??
    path.join(dirname, '..', 'fixtures', 'openapi', '3.0', 'notion.json')
  assert(pathToOpenApiSpec, 'Missing path to OpenAPI spec')

  await generateTSFromOpenAPI(pathToOpenApiSpec)
}

await main()
