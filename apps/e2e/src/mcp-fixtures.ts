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
    isError?: boolean
    result?: any
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
    debug: true,
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
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ nala: 'kitten', num: 123, now })
              }
            ]
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
          result: {
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
      }
    ]
  }
]
