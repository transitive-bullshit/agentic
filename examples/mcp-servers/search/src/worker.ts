import { SerperClient } from '@agentic/serper'
import { StreamableHTTPTransport } from '@hono/mcp'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Hono } from 'hono'
import { z } from 'zod'

import { type Env, parseEnv } from './env'

let serper: SerperClient

const app = new Hono()

const mcpServer = new McpServer({
  name: 'search',
  version: '1.0.0'
})

app.all('/mcp', async (c) => {
  const transport = new StreamableHTTPTransport()
  await mcpServer.connect(transport)
  return transport.handleRequest(c)
})

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const parsedEnv = parseEnv(env)

    if (!serper) {
      serper = new SerperClient({ apiKey: parsedEnv.SERPER_API_KEY })

      mcpServer.registerTool(
        'search',
        {
          description:
            'Uses Google Search to return the most relevant web pages for a given query. Useful for finding up-to-date news and information about any topic.',
          inputSchema: z.object({
            query: z.string().describe('Search query'),
            num: z
              .number()
              .int()
              .default(5)
              .optional()
              .describe('Number of results to return'),
            type: z
              .enum([
                'search',
                'images',
                'videos',
                'places',
                'news',
                'shopping'
              ])
              .default('search')
              .optional()
              .describe('Type of Google search to perform')
          }).shape,
          outputSchema: z
            .object({
              results: z.any(),
              answerBox: z.any().optional(),
              knowledgeGraph: z.any().optional(),
              images: z.any().optional(),
              videos: z.any().optional(),
              places: z.any().optional(),
              news: z.any().optional(),
              shopping: z.any().optional()
            })
            .passthrough().shape
        },
        async (args, { _meta }) => {
          // Make sure the request is coming from Agentic
          if (
            (_meta?.agentic as any)?.agenticProxySecret !==
            parsedEnv.AGENTIC_PROXY_SECRET
          ) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Invalid request: must come from Agentic MCP proxy'
                }
              ]
            }
          }

          const result: any = await serper!.search({
            q: args.query,
            num: args.num ?? 5,
            type: args.type ?? 'search'
          })

          // Simplify search results to optimize for LLM usage
          result.results = result.organic
          delete result.organic
          delete result.topStories
          delete result.peopleAlsoAsk
          delete result.searchParameters
          delete result.credits
          delete result.relatedSearches

          return {
            content: [],
            structuredContent: result
          }
        }
      )
    }

    return app.fetch(request, parsedEnv, ctx)
  }
} satisfies ExportedHandler<Env>
