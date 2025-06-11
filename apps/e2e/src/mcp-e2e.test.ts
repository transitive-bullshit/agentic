import { pick } from '@agentic/platform-core'
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
        content: expectedContent,
        structuredContent: expectedStructuredContent,
        _meta: expectedMeta,
        _agenticMeta: expectedAgenticMeta,
        _agenticMetaHeaders: expectedAgenticMetaHeaders,
        validate
      } = fixture.response ?? {}
      const expectedSnapshot =
        fixture.response?.snapshot ?? fixtureSuite.snapshot ?? false
      const expectedStableSnapshot =
        fixture.response?.stableSnapshot ??
        fixtureSuite.stableSnapshot ??
        !isError
      const debugFixture = !!(
        fixture.debug ??
        fixtureSuite.debug ??
        fixture.only ??
        fixtureSuite.only
      )
      const fixtureName = `${i}.${j}: ${fixtureSuite.path} ${fixture.request.name}`

      let testFn = (fixture.only ?? fixture.debug) ? test.only : test
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

          if (debugFixture) {
            console.log(fixtureName, '=>', result)
          }

          if (isError) {
            expect(result.isError).toBeTruthy()
          } else {
            expect(result.isError).toBeFalsy()
          }

          if (expectedResult) {
            expect(result).toEqual(expectedResult)
          }

          if (expectedContent) {
            expect(result.content).toEqual(expectedContent)
          }

          if (expectedStructuredContent) {
            expect(result.structuredContent).toEqual(expectedStructuredContent)
          }

          if (expectedMeta) {
            expect(result._meta).toBeDefined()
            expect(typeof result._meta).toEqual('object')
            expect(!Array.isArray(result._meta)).toBeTruthy()
            for (const [key, value] of Object.entries(expectedMeta)) {
              expect(result._meta![key]).toEqual(value)
            }
          }
          if (expectedAgenticMeta) {
            expect(result._meta).toBeDefined()
            expect(result._meta?.agentic).toBeDefined()
            expect(typeof result._meta?.agentic).toEqual('object')
            expect(!Array.isArray(result._meta?.agentic)).toBeTruthy()
            for (const [key, value] of Object.entries(expectedAgenticMeta)) {
              expect((result._meta!.agentic as any)[key]).toEqual(value)
            }
          }

          if (expectedAgenticMetaHeaders) {
            expect(result._meta).toBeDefined()
            expect(result._meta?.agentic).toBeDefined()
            expect(typeof result._meta?.agentic).toEqual('object')
            expect(!Array.isArray(result._meta?.agentic)).toBeTruthy()
            expect(typeof (result._meta?.agentic as any)?.headers).toEqual(
              'object'
            )
            expect(
              !Array.isArray((result._meta?.agentic as any)?.headers)
            ).toBeTruthy()
            for (const [key, value] of Object.entries(
              expectedAgenticMetaHeaders
            )) {
              expect((result._meta!.agentic as any).headers[key]).toEqual(value)
            }
          }

          if (expectedSnapshot) {
            expect(result).toMatchSnapshot()
          }

          if (expectedStableSnapshot) {
            expect(
              pick(result, 'content', 'structuredContent', 'isError')
            ).toMatchSnapshot()
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
        }
      )
    }
  })
}
