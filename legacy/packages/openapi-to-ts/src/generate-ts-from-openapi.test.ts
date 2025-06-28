import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, test } from 'vitest'

import { generateTSFromOpenAPI } from './generate-ts-from-openapi'

const fixtures = [
  'firecrawl.json',
  // 'github.json', // TODO: not working 100% yet
  'notion.json',
  // 'open-meteo.yaml',
  'pet-store.json',
  'petstore-expanded.json',
  'security.json'
  // 'stripe.json', // TODO: not working 100% yet
  // 'tic-tac-toe.json'
]

const dirname = path.join(fileURLToPath(import.meta.url), '..', '..')

describe('openapi-to-ts', () => {
  for (const fixture of fixtures) {
    test(
      fixture,
      {
        timeout: 60_000
      },
      async () => {
        const fixturePath = path.join(dirname, 'fixtures', 'openapi', fixture)
        const outputDir = path.join(dirname, 'fixtures', 'generated')

        const result = await generateTSFromOpenAPI({
          openapiFilePath: fixturePath,
          outputDir
        })
        expect(result).toMatchSnapshot()
      }
    )
  }
})
