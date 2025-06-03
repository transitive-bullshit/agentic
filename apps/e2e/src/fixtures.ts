export type E2ETestFixture = {
  path: string

  /** @default 60_000 milliseconds */
  timeout?: number

  request?: {
    /** @default 'GET' */
    method?: 'GET' | 'POST'
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

export const fixtures: E2ETestFixture[] = [
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
