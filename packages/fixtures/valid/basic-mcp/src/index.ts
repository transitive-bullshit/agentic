import 'dotenv/config'

import { FastMCP } from 'fastmcp'
import { z } from 'zod'

import { env } from './env'

const server = new FastMCP({
  name: 'Agentic basic test MCP server',
  version: '0.0.1'
})

server.addTool({
  name: 'add',
  description: 'Add two numbers',
  parameters: z.object({
    a: z.number(),
    b: z.number()
  }),
  execute: async (args) => {
    return String(args.a + args.b)
  }
})

server.addTool({
  name: 'add2',
  description: 'TODO',
  parameters: z.object({
    a: z.number(),
    b: z.number()
  }),
  execute: async (args) => {
    return String(args.a + args.b)
  }
})

await server.start({
  transportType: 'httpStream',
  httpStream: {
    port: env.PORT
  }
})
