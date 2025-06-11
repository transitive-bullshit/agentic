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
  }

  response?: {
    result?: any
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
    title: 'Basic MCP => OpenAPI get_post success',
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
    title: 'Basic MCP => OpenAPI @ latest get_post success ',
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
    title: 'Basic MCP => OpenAPI @ 010332cf get_post success ',
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
    title: 'Basic MCP => MCP "echo" tool call success',
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
          ]
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
          ]
        }
      }
    ]
  },
  {
    title: 'Basic MCP => OpenAPI get_post errors',
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
    title: 'Basic MCP => OpenAPI everything errors',
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
  }
]
