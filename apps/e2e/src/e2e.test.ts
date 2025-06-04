import contentType from 'fast-content-type-parse'
import defaultKy from 'ky'
import { describe, expect, test } from 'vitest'

import { env } from './env'
import { fixtureSuites } from './fixtures'

const ky = defaultKy.extend({
  prefixUrl: env.AGENTIC_GATEWAY_BASE_URL,

  // Disable automatic retries for testing.
  retry: 0
})

for (const [i, fixtureSuite] of fixtureSuites.entries()) {
  const { title, fixtures } = fixtureSuite

  describe(title, () => {
    let responseBody: any | undefined

    for (const [j, fixture] of fixtures.entries()) {
      const method = fixture.request?.method ?? 'GET'
      const {
        status = 200,
        contentType: expectedContentType = 'application/json',
        headers: expectedHeaders,
        body: expectedBody
      } = fixture.response ?? {}
      const { snapshot = status >= 200 && status < 300 } =
        fixture.response ?? {}

      test.sequential(
        `${i}.${j}: ${method} ${fixture.path}`,
        {
          timeout: fixture.timeout ?? 60_000
        },
        // eslint-disable-next-line no-loop-func
        async () => {
          const res = await ky(fixture.path, fixture.request)
          expect(res.status).toBe(status)

          const { type } = contentType.safeParse(
            res.headers.get('content-type') ?? ''
          )
          expect(type).toBe(expectedContentType)

          if (expectedHeaders) {
            for (const [key, value] of Object.entries(expectedHeaders)) {
              expect(res.headers.get(key)).toBe(value)
            }
          }

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

          if (expectedBody) {
            expect(body).toEqual(expectedBody)
          }

          if (snapshot) {
            expect(body).toMatchSnapshot()
          }

          if (status >= 200 && status < 300) {
            if (!responseBody) {
              responseBody = body
            } else {
              expect(body).toEqual(responseBody)
            }
          }

          console.log(`${i}.${j}: ${method} ${fixture.path}`, {
            status,
            body,
            headers: Object.fromEntries(res.headers.entries())
          })
        }
      )
    }
  })
}
