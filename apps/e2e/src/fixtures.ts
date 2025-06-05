export type E2ETestFixture = {
  path: string

  /** @default 60_000 milliseconds */
  timeout?: number

  /** @default false */
  only?: boolean

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
  only?: boolean

  /** @default false */
  sequential?: boolean

  /** @default false */
  compareResponseBodies?: boolean
}

export const fixtureSuites: E2ETestFixtureSuite[] = [
  {
    title: 'Basic OpenAPI getPost success',
    compareResponseBodies: true,
    fixtures: [
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          method: 'POST',
          json: {
            postId: 1
          }
        }
      },
      {
        path: '@dev/test-basic-openapi@latest/getPost',
        request: {
          method: 'POST',
          json: {
            postId: 1
          }
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          searchParams: {
            // all of these GET requests implicitly test type coercion since
            // `postId` as a query param will be a string, but the tool expects
            // an integer.
            postId: 1
          }
        }
      },
      {
        path: '@dev/test-basic-openapi@fc856666/getPost?postId=1'
      },
      {
        path: '@dev/test-basic-openapi@fc856666/get_post?postId=1'
      },
      {
        path: '@dev/test-basic-openapi@fc856666/getPost',
        request: {
          searchParams: {
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
        path: '@dev/test-basic-openapi/getPost',

        response: {
          // Missing `postId` parameter.
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi@fc856666/getPost?postId=foo',
        response: {
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi@00000000/getPost',
        response: {
          status: 404
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
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
        path: '@dev/test-basic-openapi@latest/get_kittens?postId=1',
        response: {
          status: 404
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          searchParams: {
            // invalid `postId` field type
            postId: 'not-a-number'
          }
        },
        response: {
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          method: 'POST',
          json: {
            // missing required `postId` field
          }
        },
        response: {
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          method: 'POST',
          json: {
            // invalid `postId` field type
            postId: 'foo'
          }
        },
        response: {
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          method: 'POST',
          json: {
            // invalid `postId` field type
            postId: 'foo'
          }
        },
        response: {
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          method: 'POST',
          json: {
            postId: 1,
            // additional json body params should throw an error
            foo: 'bar'
          }
        },
        response: {
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          searchParams: {
            postId: 1,
            // additional search params should throw an error
            foo: 'bar'
          }
        },
        response: {
          status: 400
        }
      }
    ]
  },
  {
    title: 'Bypass caching',
    compareResponseBodies: true,
    fixtures: [
      {
        // ensure we bypass the cache for requests with `pragma: no-cache`
        path: '@dev/test-basic-openapi@fc856666/getPost',
        request: {
          headers: {
            pragma: 'no-cache'
          },
          searchParams: {
            postId: 9
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'BYPASS'
          }
        }
      },
      {
        // ensure we bypass the cache for requests with `pragma: no-cache`
        path: '@dev/test-basic-openapi@fc856666/getPost?postId=9',
        request: {
          headers: {
            'cache-control': 'no-cache'
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'BYPASS'
          }
        }
      },
      {
        // ensure we bypass the cache for requests with `cache-control: no-store`
        path: '@dev/test-basic-openapi@fc856666/get_post?postId=9',
        request: {
          headers: {
            'cache-control': 'no-store'
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'BYPASS'
          }
        }
      },
      {
        path: '@dev/test-basic-openapi@fc856666/get_post?postId=9',
        request: {
          headers: {
            'cache-control': 'max-age=0, must-revalidate, no-cache'
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'BYPASS'
          }
        }
      }
    ]
  },
  {
    title: 'Basic GET caching',
    compareResponseBodies: true,
    sequential: true,
    fixtures: [
      {
        // first request to ensure the cache is populated
        path: '@dev/test-basic-openapi@fc856666/getPost',
        request: {
          searchParams: {
            postId: 9
          }
        }
      },
      {
        // second request should hit the cache
        path: '@dev/test-basic-openapi@fc856666/getPost?postId=9',
        response: {
          headers: {
            'cf-cache-status': 'HIT'
          }
        }
      },
      {
        // normalized request should also hit the cache
        path: '@dev/test-basic-openapi@fc856666/get_post?postId=9',
        response: {
          headers: {
            'cf-cache-status': 'HIT'
          }
        }
      }
    ]
  },
  {
    title: 'Basic POST caching',
    compareResponseBodies: true,
    sequential: true,
    fixtures: [
      {
        // first request to ensure the cache is populated
        path: '@dev/test-basic-openapi@fc856666/get_post',
        request: {
          method: 'POST',
          json: {
            postId: 13
          }
        }
      },
      {
        // second request should hit the cache
        path: '@dev/test-basic-openapi@fc856666/get_post',
        request: {
          method: 'POST',
          json: {
            postId: 13
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'HIT'
          }
        }
      }
    ]
  }
  // {
  //   title: 'Basic MCP origin tool call success',
  //   compareResponseBodies: true,
  //   fixtures: [
  //     {
  //       path: '@dev/test-basic-openapi@fc856666/get_post',
  //       request: {
  //         method: 'POST',
  //         json: {
  //           postId: 13
  //         }
  //       }
  //     },
  //   ]
  // }
]
