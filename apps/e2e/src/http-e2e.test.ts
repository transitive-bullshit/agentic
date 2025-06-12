import contentType from 'fast-content-type-parse'
import defaultKy from 'ky'
import { describe, expect, test } from 'vitest'

import { env } from './env'
import { fixtureSuites } from './http-fixtures'

const ky = defaultKy.extend({
  prefixUrl: env.AGENTIC_GATEWAY_BASE_URL,

  // Disable automatic retries for testing.
  retry: 0,

  // Some tests expect HTTP errors, so handle them manually instead of throwing.
  throwHttpErrors: false
})

for (const [i, fixtureSuite] of fixtureSuites.entries()) {
  const {
    title,
    fixtures,
    compareResponseBodies = false,
    repeat = 1,
    repeatSuccessCriteria = 'all'
  } = fixtureSuite

  const describeFn = fixtureSuite.only ? describe.only : describe
  describeFn(title, () => {
    let fixtureResponseBody: any | undefined

    for (const [j, fixture] of fixtures.entries()) {
      const method = fixture.request?.method ?? 'GET'
      const timeout = fixture.timeout ?? 30_000
      const {
        status = 200,
        contentType: expectedContentType = 'application/json',
        headers: expectedHeaders,
        body: expectedBody,
        validate
      } = fixture.response ?? {}
      const snapshot =
        fixture.response?.snapshot ??
        fixtureSuite.snapshot ??
        (status >= 200 && status < 300)
      const debugFixture = !!(
        fixture.debug ??
        fixtureSuite.debug ??
        fixture.only ??
        fixtureSuite.only
      )
      const fixtureName = `${i}.${j}: ${method} ${fixture.path}`

      let testFn = (fixture.only ?? fixture.debug) ? test.only : test
      if (fixtureSuite.sequential) {
        testFn = testFn.sequential
      }

      testFn(
        fixtureName,
        {
          timeout
        },
        // eslint-disable-next-line no-loop-func
        async () => {
          const numIterations = repeat ?? 1
          let numRepeatSuccesses = 0

          for (let iteration = 0; iteration < numIterations; ++iteration) {
            const repeatIterationPrefix = repeat
              ? `[${iteration}/${numIterations}] `
              : ''

            const res = await ky(fixture.path, {
              timeout,
              ...fixture.request
            })

            if (res.status !== status && res.status >= 500) {
              let body: any
              try {
                body = await res.json()
              } catch {}

              console.error(
                `${repeatIterationPrefix}${fixtureName} => UNEXPECTED ERROR ${res.status}`,
                {
                  body
                }
              )
            }

            if (repeat) {
              if (res.status === status) {
                ++numRepeatSuccesses
              } else {
                if (debugFixture) {
                  console.log(
                    `${repeatIterationPrefix}${fixtureName} => ${res.status} (invalid; expected ${status})`,
                    {
                      headers: Object.fromEntries(res.headers.entries())
                    }
                  )
                }

                continue
              }
            } else {
              expect(res.status).toBe(status)
            }

            const { type } = contentType.safeParse(
              res.headers.get('content-type') ?? ''
            )
            expect(type).toBe(expectedContentType)

            let body: any

            if (type.includes('json')) {
              try {
                body = await res.json()
              } catch (err) {
                console.error('json error', err)
                throw err
              }
            } else if (type.includes('text')) {
              body = await res.text()
            } else {
              body = await res.arrayBuffer()
            }

            if (debugFixture) {
              console.log(
                `${repeatIterationPrefix}${fixtureName} => ${res.status}`,
                {
                  body,
                  headers: Object.fromEntries(res.headers.entries())
                }
              )
            }

            if (expectedBody) {
              expect(body).toEqual(expectedBody)
            }

            if (validate) {
              await Promise.resolve(validate(body))
            }

            if (snapshot) {
              expect(body).toMatchSnapshot()
            }

            if (expectedHeaders) {
              for (const [key, value] of Object.entries(expectedHeaders)) {
                expect(res.headers.get(key)).toBe(value)
              }
            }

            if (compareResponseBodies && status >= 200 && status < 300) {
              if (!fixtureResponseBody) {
                fixtureResponseBody = body
              } else {
                expect(body).toEqual(fixtureResponseBody)
              }
            }
          }

          if (repeat) {
            if (repeatSuccessCriteria === 'all') {
              expect(numRepeatSuccesses).toBe(numIterations)
            } else if (repeatSuccessCriteria === 'some') {
              expect(numRepeatSuccesses).toBeGreaterThan(0)
            } else if (typeof repeatSuccessCriteria === 'function') {
              expect(repeatSuccessCriteria(numRepeatSuccesses)).toBe(true)
            }
          }
        }
      )
    }
  })
}
