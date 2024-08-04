import defaultKy, {
  type AfterResponseHook,
  type BeforeRequestHook,
  type KyInstance
} from 'ky'

const AGENTIC_TEST_MOCK_HEADER = 'x-agentic-test-mock'

function defaultBeforeRequest(request: Request): Response {
  return new Response(
    JSON.stringify({
      url: request.url,
      method: request.method,
      headers: request.headers
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        [AGENTIC_TEST_MOCK_HEADER]: '1'
      }
    }
  )
}

export function mockKyInstance(
  ky: KyInstance = defaultKy,
  {
    beforeRequest = defaultBeforeRequest,
    afterResponse
  }: {
    beforeRequest?: BeforeRequestHook
    afterResponse?: AfterResponseHook
  } = {}
): KyInstance {
  return ky.extend({
    hooks: {
      beforeRequest: beforeRequest ? [beforeRequest] : [],
      afterResponse: afterResponse ? [afterResponse] : []
    }
  })
}
