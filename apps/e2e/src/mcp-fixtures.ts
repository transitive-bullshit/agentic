import { expect } from 'vitest'

export type MCPE2ETestFixture = {
  /** @default 60_000 milliseconds */
  timeout?: number

  /** @default false */
  only?: boolean

  /** @default false */
  debug?: boolean

  request: {
    name: string
    args: Record<string, unknown>
    _meta?: Record<string, unknown>
  }

  response?: {
    result?: any
    /** @default false */
    isError?: boolean
    content?: Array<Record<string, unknown>>
    structuredContent?: any
    _meta?: Record<string, unknown>
    _agenticMeta?: Record<string, unknown>
    _agenticMetaHeaders?: Record<string, unknown>
    validate?: (result: any) => void | Promise<void>
    /** @default undefined */
    snapshot?: boolean
    /** @default true */
    stableSnapshot?: boolean
  }
}

export type MCPE2ETestFixtureSuite = {
  title: string
  path: string
  fixtures: MCPE2ETestFixture[]

  /** @default false */
  only?: boolean

  /** @default false */
  sequential?: boolean

  /** @default false */
  compareResponseBodies?: boolean

  /** @default false */
  debug?: boolean

  /**
   * Not used by default because the result `_meta.agentic` contains some
   * metadata which may not be stable across test runs such as `cacheStatus`
   * and `headers`.
   *
   * @default false
   */
  snapshot?: boolean

  /** @default undefined */
  stableSnapshot?: boolean
}

const now = Date.now()

export const fixtureSuites: MCPE2ETestFixtureSuite[] = [
  {
    title: 'MCP => OpenAPI origin basic get_post success',
    path: '@dev/test-basic-openapi/mcp',
    fixtures: [
      {
        request: {
          name: 'get_post',
          args: {
            postId: 1
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin basic @ latest get_post success ',
    path: '@dev/test-basic-openapi@latest/mcp',
    fixtures: [
      {
        request: {
          name: 'get_post',
          args: {
            postId: 3
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin basic @ 010332cf get_post success ',
    path: '@dev/test-basic-openapi@010332cf/mcp',
    fixtures: [
      {
        request: {
          name: 'get_post',
          args: {
            postId: 8
          }
        }
      }
    ]
  },
  {
    title: 'MCP => MCP origin basic "echo" tool call success',
    path: '@dev/test-basic-mcp/mcp',
    stableSnapshot: false,
    fixtures: [
      {
        request: {
          name: 'echo',
          args: {
            nala: 'kitten',
            num: 123,
            now
          }
        },
        response: {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ nala: 'kitten', num: 123, now })
            }
          ],
          _agenticMeta: {
            cacheStatus: 'DYNAMIC'
          }
        }
      },
      {
        request: {
          name: 'echo',
          args: {
            nala: 'kitten',
            num: 123,
            now: `${now}`
          }
        },
        response: {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                nala: 'kitten',
                num: 123,
                now: `${now}`
              })
            }
          ],
          _agenticMeta: {
            cacheStatus: 'DYNAMIC'
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin basic get_post errors',
    path: '@dev/test-basic-openapi/mcp',
    fixtures: [
      {
        request: {
          name: 'get_post',
          args: {
            // Missing required `postId` parameter
            nala: 'kitten',
            num: 123,
            now
          }
        },
        response: {
          isError: true,
          _agenticMeta: {
            status: 400
          }
        }
      },
      {
        request: {
          name: 'get_post',
          args: {
            // invalid `postId` parameter
            postId: 'not-a-number'
          }
        },
        response: {
          isError: true,
          _agenticMeta: {
            status: 400
          }
        }
      },
      {
        request: {
          name: 'get_kittens',
          args: {
            postId: 7
          }
        },
        response: {
          isError: true,
          _agenticMeta: {
            // 'get_kittens' tool doesn't exist
            status: 404,
            toolName: 'get_kittens'
          }
        }
      },
      {
        request: {
          name: 'get_post',
          args: {
            postId: 7,
            // additional json body params are allowed by default
            foo: 'bar'
          }
        },
        response: {
          isError: false
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin everything errors',
    path: '@dev/test-everything-openapi/mcp',
    fixtures: [
      {
        request: {
          name: 'strict_additional_properties',
          args: {
            foo: 'bar'
          }
        },
        response: {
          isError: false
        }
      },
      {
        request: {
          name: 'strict_additional_properties',
          args: {
            foo: 'bar',
            // additional params should throw an error if the tool
            // config has `additionalProperties: false`
            extra: 'nala'
          }
        },
        response: {
          isError: true,
          _agenticMeta: {
            status: 400
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin basic bypass caching',
    path: '@dev/test-basic-openapi@fc856666/mcp',
    fixtures: [
      {
        // ensure we bypass the cache for requests for tools which do not have
        // a custom `pure` or `cacheControl` set in their tool config.
        request: {
          name: 'get_post',
          args: {
            postId: 1
          }
        },
        response: {
          isError: false,
          _agenticMeta: {
            cacheStatus: 'BYPASS'
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin basic caching',
    path: '@dev/test-basic-openapi@010332cf/mcp',
    fixtures: [
      {
        request: {
          name: 'get_post',
          args: {
            postId: 1
          }
        },
        response: {
          isError: false
        }
      },
      {
        request: {
          name: 'get_post',
          args: {
            postId: 1
          }
        },
        response: {
          isError: false,
          _agenticMeta: {
            // second request should hit the cache
            cacheStatus: 'HIT'
          }
        }
      },
      {
        request: {
          name: 'get_post',
          args: {
            postId: 1
          },
          // disable caching via a custom metadata cache-control header
          _meta: {
            agentic: {
              headers: {
                'cache-control': 'no-store'
              }
            }
          }
        },
        response: {
          isError: false,
          _agenticMeta: {
            cacheStatus: 'BYPASS'
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin basic normalized caching',
    path: '@dev/test-basic-openapi@010332cf/mcp',
    fixtures: [
      {
        request: {
          name: 'get_post',
          args: {
            postId: 1,
            foo: true,
            nala: 'kitten'
          }
        },
        response: {
          isError: false
        }
      },
      {
        request: {
          name: 'get_post',
          args: {
            foo: true,
            postId: 1,
            nala: 'kitten'
          }
        },
        response: {
          isError: false,
          _agenticMeta: {
            // second request should hit the cache even though the args are in a
            // different order
            cacheStatus: 'HIT'
          }
        }
      }
    ]
  },
  {
    title: 'MCP => MCP origin basic "add" tool call success',
    path: '@dev/test-basic-mcp/mcp',
    stableSnapshot: false,
    fixtures: [
      {
        request: {
          name: 'add',
          args: {
            a: 13,
            b: 49
          }
        },
        response: {
          isError: false,
          content: [{ type: 'text', text: '62' }]
        }
      }
    ]
  },
  {
    title: 'MCP => MCP origin basic "echo" tool',
    path: '@dev/test-basic-mcp/mcp',
    stableSnapshot: false,
    fixtures: [
      {
        request: {
          name: 'echo',
          args: {
            nala: 'kitten',
            num: 123,
            now
          }
        },
        response: {
          isError: false,
          content: [
            {
              type: 'text',
              text: JSON.stringify({ nala: 'kitten', num: 123, now })
            }
          ]
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin everything "pure" tool',
    path: '@dev/test-everything-openapi/mcp',
    compareResponseBodies: true,
    fixtures: [
      {
        request: {
          name: 'echo',
          args: {
            nala: 'kitten',
            foo: 'bar'
          },
          _meta: {
            agentic: {
              headers: {
                'cache-control':
                  'public, max-age=31560000, s-maxage=31560000, stale-while-revalidate=3600'
              }
            }
          }
        },
        response: {
          isError: false,
          structuredContent: {
            nala: 'kitten',
            foo: 'bar'
          }
        }
      },
      {
        // second request should hit the cache
        request: {
          name: 'echo',
          args: {
            nala: 'kitten',
            foo: 'bar'
          },
          _meta: {
            agentic: {
              headers: {
                'cache-control':
                  'public, max-age=31560000, s-maxage=31560000, stale-while-revalidate=3600'
              }
            }
          }
        },
        response: {
          isError: false,
          structuredContent: {
            nala: 'kitten',
            foo: 'bar'
          },
          _agenticMeta: {
            cacheStatus: 'HIT'
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin everything "disabled_tool" tool',
    path: '@dev/test-everything-openapi/mcp',
    fixtures: [
      {
        request: {
          name: 'disabled_tool',
          args: {
            foo: 'bar'
          }
        },
        response: {
          isError: true,
          _agenticMeta: {
            status: 404,
            toolName: 'disabled_tool'
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin everything "echo" tool with empty body',
    path: '@dev/test-everything-openapi/mcp',
    fixtures: [
      {
        request: {
          name: 'echo',
          args: {}
        },
        response: {
          isError: false,
          structuredContent: {}
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin everything "unpure_marked_pure" tool',
    path: '@dev/test-everything-openapi/mcp',
    compareResponseBodies: true,
    fixtures: [
      {
        request: {
          name: 'unpure_marked_pure',
          args: {
            nala: 'cat'
          }
        },
        response: {
          isError: false,
          validate: (result) => {
            const body = result.structuredContent
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
        request: {
          name: 'unpure_marked_pure',
          args: {
            nala: 'cat'
          }
        },
        response: {
          isError: false,
          _agenticMeta: {
            cacheStatus: 'HIT'
          }
        }
      }
    ]
  },
  {
    title: 'MCP => OpenAPI origin everything "echo_headers" tool',
    path: '@dev/test-everything-openapi/mcp',
    stableSnapshot: false,
    fixtures: [
      {
        request: {
          name: 'echo_headers',
          args: {}
        },
        response: {
          validate: (result) => {
            expect(result.structuredContent['x-agentic-proxy-secret']).toEqual(
              'f279280a67a15df6e0245511bdeb11854fc8f6f702c49d028431bb1dbc03bfdc'
            )
          }
        }
      }
    ]
  }
]
