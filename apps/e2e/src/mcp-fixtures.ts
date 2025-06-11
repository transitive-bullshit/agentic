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
    validate?: (result: any) => void | Promise<void>
    /** @default true */
    snapshot?: boolean
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

  /** @default undefined */
  snapshot?: boolean
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
    snapshot: false,
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
    title: 'Basic MCP => MCP "echo" tool call errors',
    path: '@dev/test-basic-openapi/mcp',
    snapshot: false,
    only: true,
    fixtures: [
      {
        request: {
          name: 'get_post',
          args: {
            nala: 'kitten',
            num: 123,
            now
          }
        },
        response: {
          isError: true
        }
      }
    ]
  }
]
