import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { env } from './env'
import { fixtureSuites } from './mcp-fixtures'

for (const [i, fixtureSuite] of fixtureSuites.entries()) {
  const { title, fixtures, compareResponseBodies = false } = fixtureSuite

  const describeFn = fixtureSuite.only ? describe.only : describe
  describeFn(title, () => {
    let fixtureResult: any | undefined

    let client: McpClient
    beforeAll(async () => {
      client = new McpClient({
        name: fixtureSuite.path,
        version: '0.0.0'
      })

      const transport = new StreamableHTTPClientTransport(
        new URL(fixtureSuite.path, env.AGENTIC_GATEWAY_BASE_URL)
      )
      await client.connect(transport)
    }, 120_000)

    afterAll(async () => {
      await client.close()
    })

    for (const [j, fixture] of fixtures.entries()) {
      const {
        isError,
        result: expectedResult,
        validate
      } = fixture.response ?? {}
      const snapshot =
        fixture.response?.snapshot ?? fixtureSuite.snapshot ?? !isError
      const debugFixture = !!(fixture.debug ?? fixtureSuite.debug)
      const fixtureName = `${i}.${j}: ${fixtureSuite.path} ${fixture.request.name}`

      let testFn = fixture.only ? test.only : test
      if (fixtureSuite.sequential) {
        testFn = testFn.sequential
      }

      testFn(
        fixtureName,
        {
          timeout: fixture.timeout ?? 60_000
        },
        // eslint-disable-next-line no-loop-func
        async () => {
          const { tools } = await client.listTools()
          // console.log('tools', tools)
          expect(tools.map((t) => t.name)).toContain(fixture.request.name)

          const result = await client.callTool({
            name: fixture.request.name,
            arguments: fixture.request.args
          })
          if (isError) {
            expect(result.isError).toBeTruthy()
          } else {
            expect(result.isError).toBeFalsy()
          }

          if (expectedResult) {
            expect(result).toEqual(expectedResult)
          }

          if (snapshot) {
            expect(result).toMatchSnapshot()
          }

          if (validate) {
            await Promise.resolve(validate(result))
          }

          if (compareResponseBodies && !isError) {
            if (!fixtureResult) {
              fixtureResult = result
            } else {
              expect(result).toEqual(fixtureResult)
            }
          }

          if (debugFixture) {
            console.log(fixtureName, '=>', result)
          }
        }
      )
    }
  })
}
