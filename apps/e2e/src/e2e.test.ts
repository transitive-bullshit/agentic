import contentType from 'fast-content-type-parse'
import defaultKy from 'ky'
import { expect, test } from 'vitest'

import { env } from './env'
import { fixtures } from './fixtures'

const ky = defaultKy.extend({
  prefixUrl: env.AGENTIC_GATEWAY_BASE_URL,

  // Disable automatic retries for testing.
  retry: 0
})

for (const [i, fixture] of fixtures.entries()) {
  const method = fixture.request?.method ?? 'GET'
  const {
    status = 200,
    snapshot = true,
    contentType: expectedContentType = 'application/json',
    headers: expectedHeaders,
    body: expectedBody
  } = fixture.response ?? {}

  test(
    `${i}) ${method} ${fixture.path}`,
    {
      timeout: fixture.timeout ?? 60_000
    },
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
        body = await res.json()
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
    }
  )
}
