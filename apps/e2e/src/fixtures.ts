export type E2ETestFixture = {
  path: string

  /** @default 60_000 milliseconds */
  timeout?: number

  /** @default false */
  // only?: boolean

  request?: {
    /** @default 'GET' */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    searchParams?: Record<string, string | number | boolean>
    headers?: Record<string, string>
    json?: Record<string, unknown>
    body?: any
  }

  response?: {
    /** @default 200 */
    status?: number
    /** @default 'application/json' */
    contentType?: string
    headers?: Record<string, string>
    body?: any
    validate?: (body: any) => void
    /** @default true */
    snapshot?: boolean
  }
}

export type E2ETestFixtureSuite = {
  title: string
  fixtures: E2ETestFixture[]

  /** @default false */
  // only?: boolean
}

export const fixtureSuites: E2ETestFixtureSuite[] = [
  {
    title: 'Basic OpenAPI getPost(1)',
    fixtures: [
      {
        path: 'dev/test-basic-openapi/getPost',
        request: {
          searchParams: {
            postId: 1
          }
        }
      },
      {
        path: 'dev/test-basic-openapi@b6e21206/getPost?postId=1'
      },
      {
        path: 'dev/test-basic-openapi@b6e21206/get_post?postId=1'
      },
      {
        path: 'dev/test-basic-openapi@b6e21206/getPost',
        request: {
          searchParams: {
            postId: 1
          }
        }
      },
      {
        path: 'dev/test-basic-openapi/getPost',
        request: {
          method: 'POST',
          json: {
            postId: 1
          }
        }
      },
      {
        path: 'dev/test-basic-openapi@latest/getPost',
        request: {
          method: 'POST',
          json: {
            postId: 1
          }
        }
      }
    ]
  },
  {
    title: 'Basic OpenAPI getPost errors',
    fixtures: [
      {
        path: 'dev/test-basic-openapi/getPost',

        response: {
          // Missing `postId` parameter.
          status: 400
        }
      },
      {
        path: 'dev/test-basic-openapi@b6e21206/getPost?postId=foo',
        response: {
          status: 400
        }
      },
      {
        path: 'dev/test-basic-openapi@000000/getPost',
        response: {
          status: 404
        }
      },
      {
        path: 'dev/test-basic-openapi/getPost',
        request: {
          method: 'PUT',
          json: {
            postId: 1
          }
        },
        response: {
          status: 405
        }
      },
      {
        path: 'dev/test-basic-openapi@latest/get_kittens?postId=1',
        response: {
          status: 404
        }
      }
    ]
  }
]
