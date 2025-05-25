import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { afterAll, assert, beforeAll, describe, expect, test } from 'vitest'

import { validateOpenAPISpec } from './validate-openapi-spec'

const fixtures = [
  'basic.json',
  'firecrawl.json',
  'notion.json',
  'open-meteo.yaml',
  'pet-store.json',
  'petstore-expanded.json',
  'security.json',
  'tic-tac-toe.json'
]

const fixturesDir = path.join(
  fileURLToPath(import.meta.url),
  '..',
  '..',
  'fixtures'
)

let server: ReturnType<typeof serve> | undefined
let port: number | undefined

// Setup a simple HTTP server to test loading remote versions of the fixtures
beforeAll(async () => {
  const app = new Hono()

  app.get('/fixtures/*', async (c) => {
    const fixtureFile = c.req.path.split('/').at(-1)!
    assert(fixtureFile, `Missing fixture file: ${c.req.path}`)

    const fixturePath = path.join(fixturesDir, fixtureFile)
    const spec = await readFile(fixturePath, 'utf8')

    return c.json(spec)
  })

  await new Promise((resolve) => {
    port = 6039
    server = serve(
      {
        fetch: app.fetch,
        port
      },
      resolve
    )
  })
})

// Close the HTTP server
afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    if (server) {
      server.close((err) => (err ? reject(err) : resolve()))
    } else {
      resolve()
    }
  })
})

describe('validateOpenAPISpec', () => {
  for (const fixture of fixtures) {
    test(
      `${fixture} (string)`,
      {
        timeout: 60_000
      },
      async () => {
        const fixturePath = path.join(fixturesDir, fixture)
        const source = await readFile(fixturePath, 'utf8')

        const result = await validateOpenAPISpec(source)
        expect(result).toMatchSnapshot()
      }
    )

    test(
      `${fixture} (file url)`,
      {
        timeout: 60_000
      },
      async () => {
        const source = new URL(`file://${path.join(fixturesDir, fixture)}`)

        const result = await validateOpenAPISpec(source)
        expect(result).toMatchSnapshot()
      }
    )

    test(
      `${fixture} (http url)`,
      {
        timeout: 60_000
      },
      // eslint-disable-next-line no-loop-func
      async () => {
        assert(server)
        assert(port)

        const source = new URL(`http://localhost:${port}/fixtures/${fixture}`)

        const result = await validateOpenAPISpec(source)
        expect(result).toMatchSnapshot()
      }
    )
  }
})
