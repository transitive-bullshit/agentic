// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
// import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { assert, JsonRpcError } from '@agentic/platform-core'
import {
  InitializeRequestSchema,
  isJSONRPCError,
  isJSONRPCNotification,
  isJSONRPCRequest,
  isJSONRPCResponse,
  type JSONRPCMessage,
  JSONRPCMessageSchema
} from '@modelcontextprotocol/sdk/types.js'

import type { GatewayHonoContext } from './lib/types'
import { resolveMcpEdgeRequest } from './lib/resolve-mcp-edge-request'

// TODO: https://github.com/modelcontextprotocol/servers/blob/8fb7bbdab73eddb42aba72e8eab81102efe1d544/src/everything/sse.ts
// TODO: https://github.com/cloudflare/agents

// const transports: Map<string, StreamableHTTPClientTransport> = new Map<
//   string,
//   StreamableHTTPClientTransport
// >()
// const server = new McpServer({
//   name: 'weather',
//   version: '1.0.0',
//   capabilities: {
//     resources: {},
//     tools: {}
//   }
// })

const MAXIMUM_MESSAGE_SIZE_BYTES = 4 * 1024 * 1024 // 4MB

export async function handleMcpRequest(ctx: GatewayHonoContext) {
  const request = ctx.req.raw
  ctx.set('isJsonRpcRequest', true)

  if (request.method !== 'POST') {
    // We don't yet support GET or DELETE requests
    throw new JsonRpcError({
      message: 'Method not allowed',
      statusCode: 405,
      jsonRpcErrorCode: -32_000,
      jsonRpcId: null
    })
  }

  // validate the Accept header
  const acceptHeader = request.headers.get('accept')

  // The client MUST include an Accept header, listing both application/json and text/event-stream as supported content types.
  if (
    !acceptHeader?.includes('application/json') ||
    !acceptHeader.includes('text/event-stream')
  ) {
    throw new JsonRpcError({
      message:
        'Not Acceptable: Client must accept both "application/json" and "text/event-stream"',
      statusCode: 406,
      jsonRpcErrorCode: -32_000,
      jsonRpcId: null
    })
  }

  const ct = request.headers.get('content-type')
  if (!ct?.includes('application/json')) {
    throw new JsonRpcError({
      message:
        'Unsupported Media Type: Content-Type must be "application/json"',
      statusCode: 415,
      jsonRpcErrorCode: -32_000,
      jsonRpcId: null
    })
  }

  // Check content length against maximum allowed size
  const contentLength = Number.parseInt(
    request.headers.get('content-length') ?? '0',
    10
  )
  if (contentLength > MAXIMUM_MESSAGE_SIZE_BYTES) {
    throw new JsonRpcError({
      message: `Request body too large. Maximum size is ${MAXIMUM_MESSAGE_SIZE_BYTES} bytes`,
      statusCode: 413,
      jsonRpcErrorCode: -32_000,
      jsonRpcId: null
    })
  }

  let sessionId = request.headers.get('mcp-session-id')
  let rawMessage: unknown

  try {
    rawMessage = await request.json()
  } catch {
    throw new JsonRpcError({
      message: 'Parse error: Invalid JSON',
      statusCode: 400,
      jsonRpcErrorCode: -32_700,
      jsonRpcId: null
    })
  }

  // Make sure the message is an array to simplify logic
  const rawMessages = Array.isArray(rawMessage) ? rawMessage : [rawMessage]

  // Try to parse each message as JSON RPC. Fail if any message is invalid
  const messages: JSONRPCMessage[] = rawMessages.map((msg) => {
    const parsed = JSONRPCMessageSchema.safeParse(msg)
    if (!parsed.success) {
      throw new JsonRpcError({
        message: 'Parse error: Invalid JSON-RPC message',
        statusCode: 400,
        jsonRpcErrorCode: -32_700,
        jsonRpcId: null
      })
    }
    return parsed.data
  })

  // Before we pass the messages to the agent, there's another error condition
  // we need to enforce. Check if this is an initialization request
  // https://spec.modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle/
  const isInitializationRequest = messages.some(
    (msg) => InitializeRequestSchema.safeParse(msg).success
  )

  if (isInitializationRequest && sessionId) {
    throw new JsonRpcError({
      message:
        'Invalid Request: Initialization requests must not include a sessionId',
      statusCode: 400,
      jsonRpcErrorCode: -32_600,
      jsonRpcId: null
    })
  }

  // The initialization request must be the only request in the batch
  if (isInitializationRequest && messages.length > 1) {
    throw new JsonRpcError({
      message: 'Invalid Request: Only one initialization request is allowed',
      statusCode: 400,
      jsonRpcErrorCode: -32_600,
      jsonRpcId: null
    })
  }

  // If an Mcp-Session-Id is returned by the server during initialization,
  // clients using the Streamable HTTP transport MUST include it
  // in the Mcp-Session-Id header on all of their subsequent HTTP requests.
  if (!isInitializationRequest && !sessionId) {
    throw new JsonRpcError({
      message: 'Bad Request: Mcp-Session-Id header is required',
      statusCode: 400,
      jsonRpcErrorCode: -32_000,
      jsonRpcId: null
    })
  }

  // If we don't have a sessionId, we are serving an initialization request
  // and need to generate a new sessionId
  sessionId = sessionId ?? ctx.env.DO_MCP_SERVER.newUniqueId().toString()
  assert(
    !ctx.get('sessionId'),
    500,
    'Session ID should be set by MCP handler for MCP edge requests'
  )
  ctx.set('sessionId', sessionId)

  // Fetch the durable mcp server for this session
  const id = ctx.env.DO_MCP_SERVER.idFromName(`streamable-http:${sessionId}`)
  const durableMcpServer = ctx.env.DO_MCP_SERVER.get(id)
  const isInitialized = await durableMcpServer.isInitialized()

  if (!isInitializationRequest && !isInitialized) {
    // A session id that was never initialized was provided
    throw new JsonRpcError({
      message: 'Session not found',
      statusCode: 404,
      jsonRpcErrorCode: -32_001,
      jsonRpcId: null
    })
  }

  if (isInitializationRequest) {
    const { deployment, consumer, pricingPlan } =
      await resolveMcpEdgeRequest(ctx)

    await durableMcpServer.init({
      deployment,
      consumer,
      pricingPlan
    })
  }

  // We've validated and initialized the request! Now it's time to actually
  // handle the JSON RPC messages in the request and respond with an SSE
  // stream.

  // Create a Transform Stream for SSE
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  // If there are no requests, we send the messages downstream and
  // acknowledge the request with a 202 since we don't expect any responses
  // back through this connection.
  const hasOnlyNotificationsOrResponses = messages.every(
    (msg) => isJSONRPCNotification(msg) || isJSONRPCResponse(msg)
  )
  if (hasOnlyNotificationsOrResponses) {
    // TODO
    // for (const message of messages) {
    //   ws.send(JSON.stringify(message))
    // }

    return new Response(null, {
      status: 202
    })
  }

  for (const message of messages) {
    if (isJSONRPCRequest(message)) {
      // Add each request id that we send off to a set so that we can keep
      // track of which requests we still need a response for.
      // requestIds.add(message.id)
    }
    // ws.send(JSON.stringify(message))
  }

  // Return the streamable http response.
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'mcp-session-id': sessionId
    },
    status: 200
  })
}
