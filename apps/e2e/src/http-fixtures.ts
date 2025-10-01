import { expect } from 'vitest'

export type E2ETestFixture = {
  path: string

  /** @default 60_000 milliseconds */
  timeout?: number

  /** @default false */
  only?: boolean

  /** @default false */
  debug?: boolean

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
    validate?: (body: any) => void | Promise<void>
    /** @default true */
    snapshot?: boolean
  }
}

export type E2ETestFixtureSuite = {
  title: string
  fixtures: E2ETestFixture[]

  /**
   * Development-only flag that runs exclusively this test suite, ignoring all others.
   * Uses Vitest's `describe.only()` to focus on a single test suite.
   *
   * ⚠️ WARNING: Never commit this as `true` - it will cause CI to skip all other tests.
   *
   * @default false
   */
  only?: boolean

  /** @default false */
  sequential?: boolean

  /** @default false */
  compareResponseBodies?: boolean

  /** @default false */
  debug?: boolean

  /** @default undefined */
  snapshot?: boolean

  /** @default undefined */
  repeat?: number

  /** @default 1 */
  repeatConcurrency?: number

  /** @default 'all' */
  repeatSuccessCriteria?:
    | 'all'
    | 'some'
    | ((numRepeatSuccesses: number) => void | Promise<void>)
}

const now = Date.now()

export const fixtureSuites: E2ETestFixtureSuite[] = [
  {
    title: 'HTTP => OpenAPI origin basic getPost success',
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
        path: '@dev/test-basic-openapi/getPost?postId=1'
      },
      {
        path: '@dev/test-basic-openapi/get_post?postId=1'
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          searchParams: {
            postId: 1
          }
        }
      }
    ]
  },
  {
    title: 'HTTP => OpenAPI origin basic getPost errors',
    fixtures: [
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          method: 'GET'
        },
        response: {
          // Missing `postId` parameter.
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost?postId=foo',
        response: {
          status: 400
        }
      },
      {
        path: '@dev/test-basic-openapi@00000000/getPost',
        response: {
          // deployment hash 00000000 doesn't exist
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
          // PUT is not a valid method (must be POST)
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
            postId: 1,
            // additional json body params are allowed by default
            foo: 'bar'
          }
        },
        response: {
          status: 200
        }
      },
      {
        path: '@dev/test-basic-openapi/getPost',
        request: {
          searchParams: {
            postId: 1,
            // additional search params should allowed by default
            foo: 'bar'
          }
        },
        response: {
          status: 200
        }
      },
      {
        path: '@dev/test-everything-openapi/strict_additional_properties',
        request: {
          method: 'POST',
          json: {
            foo: 'bar',
            // additional json body params should throw an error if the tool
            // config has `additionalProperties: false`
            extra: 'nala'
          }
        },
        response: {
          status: 400
        }
      },
      {
        path: '@dev/test-everything-openapi/strict_additional_properties',
        request: {
          method: 'GET',
          searchParams: {
            foo: 'bar',
            // additional search params should throw an error if the tool
            // config has `additionalProperties: false`
            extra: 'nala'
          }
        },
        response: {
          status: 400
        }
      }
    ]
  },
  {
    title: 'HTTP => OpenAPI origin default bypass caching',
    compareResponseBodies: true,
    fixtures: [
      {
        // ensure we bypass the cache for requests for tools which do not have
        // a custom `pure` or `cacheControl` set in their tool config.
        path: '@dev/test-everything-openapi/echo',
        request: {
          searchParams: {
            postId: 9
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
    title: 'HTTP => OpenAPI origin basic bypass caching',
    compareResponseBodies: true,
    fixtures: [
      {
        // ensure we bypass the cache for requests with `pragma: no-cache`
        path: '@dev/test-basic-openapi/getPost',
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
        // ensure we bypass the cache for requests with `cache-control: no-cache`
        path: '@dev/test-basic-openapi/getPost?postId=9',
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
        path: '@dev/test-basic-openapi/get_post?postId=9',
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
        path: '@dev/test-basic-openapi/get_post?postId=9',
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
      },
      {
        path: '@dev/test-basic-openapi/get_post?postId=9',
        request: {
          headers: {
            'cache-control': 'private, max-age=3600, must-revalidate'
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
    title: 'HTTP => OpenAPI origin basic GET caching',
    compareResponseBodies: true,
    sequential: true,
    fixtures: [
      {
        // first request to ensure the cache is populated
        path: '@dev/test-basic-openapi/getPost',
        request: {
          headers: {
            'cache-control':
              'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600'
          },
          searchParams: {
            postId: 13
          }
        }
      },
      {
        // second request should hit the cache
        path: '@dev/test-basic-openapi/getPost?postId=13',
        request: {
          headers: {
            'cache-control':
              'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600'
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'HIT'
          }
        }
      },
      {
        // normalized request with different path should also hit the cache
        path: '@dev/test-basic-openapi/get_post?postId=13',
        request: {
          headers: {
            'cache-control':
              'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600'
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'HIT'
          }
        }
      }
    ]
  },
  {
    title: 'HTTP => OpenAPI origin basic POST caching',
    compareResponseBodies: true,
    sequential: true,
    fixtures: [
      {
        // first request to ensure the cache is populated
        path: '@dev/test-basic-openapi/get_post',
        request: {
          method: 'POST',
          json: {
            postId: 13
          }
        }
      },
      {
        // second request should hit the cache
        path: '@dev/test-basic-openapi/get_post',
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
  },
  {
    title: 'HTTP => MCP origin basic "add" tool',
    compareResponseBodies: true,
    fixtures: [
      {
        path: '@dev/test-basic-mcp/add',
        request: {
          method: 'POST',
          json: {
            a: 22,
            b: 20
          }
        },
        response: {
          body: [{ type: 'text', text: '42' }]
        }
      },
      {
        path: '@dev/test-basic-mcp/add',
        request: {
          searchParams: {
            a: 22,
            b: 20
          }
        },
        response: {
          body: [{ type: 'text', text: '42' }]
        }
      }
    ]
  },
  {
    title: 'HTTP => MCP origin basic "echo" tool',
    snapshot: false,
    fixtures: [
      {
        path: '@dev/test-basic-mcp/echo',
        request: {
          method: 'POST',
          json: {
            nala: 'kitten',
            num: 123,
            now
          }
        },
        response: {
          body: [
            {
              type: 'text',
              text: JSON.stringify({ nala: 'kitten', num: 123, now })
            }
          ]
        }
      },
      {
        path: '@dev/test-basic-mcp/echo',
        request: {
          searchParams: {
            nala: 'kitten',
            num: 123,
            now
          }
        },
        response: {
          body: [
            {
              type: 'text',
              text: JSON.stringify({
                nala: 'kitten',
                num: '123',
                now: `${now}`
              })
            }
          ]
        }
      }
    ]
  },
  {
    title: 'HTTP => OpenAPI origin everything "pure" tool',
    sequential: true,
    compareResponseBodies: true,
    fixtures: [
      {
        path: '@dev/test-everything-openapi/pure',
        request: {
          method: 'POST',
          json: {
            nala: 'kitten',
            foo: 'bar'
          }
        },
        response: {
          headers: {
            'cache-control':
              'public, max-age=31560000, s-maxage=31560000, stale-while-revalidate=3600'
          },
          body: {
            nala: 'kitten',
            foo: 'bar'
          }
        }
      },
      {
        // second request should hit the cache
        path: '@dev/test-everything-openapi/pure',
        request: {
          method: 'POST',
          json: {
            nala: 'kitten',
            foo: 'bar'
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'HIT',
            'cache-control':
              'public, max-age=31560000, s-maxage=31560000, stale-while-revalidate=3600'
          },
          body: {
            nala: 'kitten',
            foo: 'bar'
          }
        }
      }
    ]
  },
  {
    title: 'HTTP => OpenAPI origin everything "disabled_tool" tool',
    fixtures: [
      {
        path: '@dev/test-everything-openapi/disabled_tool',
        request: {
          method: 'POST'
        },
        response: {
          // 400 because the request body is missing
          status: 400
        }
      },
      {
        path: '@dev/test-everything-openapi/disabled_tool',
        request: {
          method: 'POST',
          json: {}
        },
        response: {
          // 404 because the tool is disabled which means its hidden
          status: 404
        }
      }
    ]
  },
  {
    title: 'HTTP => OpenAPI origin everything "echo" tool with empty body',
    compareResponseBodies: true,
    fixtures: [
      {
        path: '@dev/test-everything-openapi/echo',
        request: {
          method: 'POST',
          json: {}
        },
        response: {
          body: {}
        }
      }
    ]
  },
  {
    title: 'HTTP => OpenAPI origin everything "unpure_marked_pure" tool',
    compareResponseBodies: true,
    snapshot: false,
    fixtures: [
      {
        path: '@dev/test-everything-openapi/unpure_marked_pure',
        request: {
          method: 'POST',
          json: {
            nala: 'cat'
          }
        },
        response: {
          validate: (body) => {
            expect(body?.nala).toEqual('cat')
            expect(typeof body.now).toBe('number')
            expect(body.now).toBeGreaterThan(0)
          }
        }
      },
      {
        // compareResponseBodies should result in the same cached response body,
        // even though the origin would return a different `now` value if it
        // weren't marked `pure`.
        path: '@dev/test-everything-openapi/unpure_marked_pure',
        request: {
          method: 'POST',
          json: {
            nala: 'cat'
          }
        },
        response: {
          headers: {
            'cf-cache-status': 'HIT'
          }
        }
      }
    ]
  },
  {
    title: 'HTTP => OpenAPI origin everything "echo_headers" tool',
    snapshot: false,
    fixtures: [
      {
        path: '@dev/test-everything-openapi/echo_headers',
        response: {
          validate: (body) => {
            expect(body['x-agentic-proxy-secret']).toBeTruthy()
            expect(body['x-agentic-proxy-secret']?.length).toBe(64)
            expect(body['x-agentic-deployment-id']).toBeTruthy()
            expect(
              body['x-agentic-deployment-id']?.startsWith('depl_')
            ).toBeTruthy()
            expect(body['x-agentic-deployment-identifier']).toBeTruthy()
            expect(body['x-agentic-is-customer-subscription-active']).toEqual(
              'false'
            )
            expect(body['x-agentic-user-id']).toBeUndefined()
            expect(body['x-agentic-customer-id']).toBeUndefined()
          }
        }
      }
    ]
  },
  {
    title:
      'HTTP => OpenAPI origin everything "custom_rate_limit_tool" (strict mode)',
    repeat: 5,
    repeatSuccessCriteria: (numRepeatSuccesses) => {
      expect(
        numRepeatSuccesses,
        'should have at least three 429 responses out of 5 requests with a strict rate limit of 2 requests per 30s'
      ).toBeGreaterThanOrEqual(3)
    },
    fixtures: [
      {
        path: '@dev/test-everything-openapi/custom_rate_limit_tool',
        response: {
          status: 429,
          headers: {
            'ratelimit-policy': '2;w=30',
            'ratelimit-limit': '2'
          }
        }
      }
    ]
  },
  {
    title:
      'HTTP => OpenAPI origin everything "custom_rate_limit_approximate_tool" (approximate mode)',
    repeat: 16,
    repeatConcurrency: 8,
    repeatSuccessCriteria: (numRepeatSuccesses) => {
      expect(
        numRepeatSuccesses,
        'should have at least one 429 response'
      ).toBeGreaterThan(0)
    },
    fixtures: [
      {
        path: '@dev/test-everything-openapi/custom_rate_limit_approximate_tool',
        response: {
          status: 429,
          headers: {
            'ratelimit-policy': '2;w=30',
            'ratelimit-limit': '2'
          }
        }
      }
    ]
  }
  // TODO
  // {
  //   title: 'HTTP => Production MCP origin "search" tool',
  //   // NOTE: this one actually hits a production service and costs a small
  //   // amount of $ per request.
  //   fixtures: [
  //     {
  //       path: '@agentic/search/search',
  //       request: {
  //         method: 'POST',
  //         json: {
  //           query: 'latest ai news'
  //         }
  //       },
  //       response: {
  //         snapshot: false
  //       }
  //     }
  //   ]
  // }
]
