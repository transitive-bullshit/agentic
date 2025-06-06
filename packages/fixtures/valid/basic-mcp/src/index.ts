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
  description: 'Add two numbers.',
  parameters: z.object({
    a: z.number(),
    b: z.number()
  }),
  execute: async (args) => {
    return String(args.a + args.b)
  }
})

server.addTool({
  name: 'echo',
  description: 'Echos back the input parameters.',
  parameters: z.any(),
  execute: async (args) => {
    return JSON.stringify(args)
  }
})

await server.start({
  transportType: 'httpStream',
  httpStream: {
    port: env.PORT
  }
})
