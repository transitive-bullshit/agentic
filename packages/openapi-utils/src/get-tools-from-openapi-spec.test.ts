import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, test } from 'vitest'

import { getToolsFromOpenAPISpec } from './get-tools-from-openapi-spec'
import { validateOpenAPISpec } from './validate-openapi-spec'

const validFixtures = [
  'basic.json',
  'mixed.json',
  'firecrawl.json',
  'open-meteo.yaml',
  'pet-store.json',
  'petstore-expanded.json',
  'security.json',
  'tic-tac-toe.json'
]

const invalidFixtures = ['notion.json']

const fixturesDir = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  'fixtures'
)

describe('getToolsFromOpenAPISpec', () => {
  test('remote spec https://agentic-platform-fixtures-everything.onrender.com/docs', async () => {
    const source =
      'https://agentic-platform-fixtures-everything.onrender.com/docs'
    const spec = await validateOpenAPISpec(source, {
      dereference: true
    })
    const result = await getToolsFromOpenAPISpec(spec)
    expect(result).toMatchSnapshot()
  })

  for (const fixture of validFixtures) {
    test(
      fixture,
      {
        timeout: 60_000
      },
      async () => {
        const fixturePath = path.join(fixturesDir, fixture)
        const source = await readFile(fixturePath, 'utf8')

        const spec = await validateOpenAPISpec(source, {
          dereference: true
        })
        const result = await getToolsFromOpenAPISpec(spec)

        expect(result).toMatchSnapshot()
      }
    )
  }

  for (const fixture of invalidFixtures) {
    test(
      `${fixture} (invalid)`,
      {
        timeout: 60_000
      },
      async () => {
        const fixturePath = path.join(fixturesDir, fixture)
        const source = await readFile(fixturePath, 'utf8')

        const spec = await validateOpenAPISpec(source, {
          dereference: true
        })

        await expect(async () =>
          getToolsFromOpenAPISpec(spec)
        ).rejects.toThrowError()
      }
    )
  }
})
