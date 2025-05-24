import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, test } from 'vitest'

import { validateOpenAPISpec } from './validate-openapi-spec'

const fixtures = [
  'basic.json',
  'firecrawl.json',
  'github.json',
  'notion.json',
  // 'open-meteo.yaml', // TODO
  'pet-store.json',
  'petstore-expanded.json',
  'security.json',
  'stripe.json',
  'tic-tac-toe.json'
]

const dirname = path.join(fileURLToPath(import.meta.url), '..', '..')

describe('validateOpenAPISpec', () => {
  for (const fixture of fixtures) {
    test(
      fixture,
      {
        timeout: 60_000
      },
      async () => {
        const fixturePath = path.join(dirname, 'fixtures', fixture)
        const spec = await readFile(fixturePath, 'utf8')

        const result = await validateOpenAPISpec(spec)
        expect(result).toMatchSnapshot()
      }
    )
  }
})
