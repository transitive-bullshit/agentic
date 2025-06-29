import type { AdminDeployment, Tool } from '@agentic/platform-types'
import { assert, HttpError } from '@agentic/platform-core'

import type { GatewayHonoContext } from './types'
import { cfValidateJsonSchema } from './cf-validate-json-schema'

export async function getToolArgsFromRequest(
  ctx: GatewayHonoContext,
  {
    tool,
    deployment
  }: {
    tool: Tool
    deployment: AdminDeployment
  }
): Promise<Record<string, any>> {
  const logger = ctx.get('logger')
  const request = ctx.req.raw
  assert(
    deployment.origin.type !== 'raw',
    500,
    `Internal logic error for origin adapter type "${deployment.origin.type}"`
  )

  if (request.method === 'GET') {
    // Args will be coerced to match their expected types via
    // `cfValidateJsonSchemaObject` since all values will be strings.
    const incomingRequestArgsRaw = Object.fromEntries(
      new URL(request.url).searchParams.entries()
    )

    const toolConfig = deployment.toolConfigs.find(
      (toolConfig) => toolConfig.name === tool.name
    )

    // Validate incoming request params against the tool's input schema.
    const incomingRequestArgs = cfValidateJsonSchema<Record<string, any>>({
      schema: tool.inputSchema,
      data: incomingRequestArgsRaw,
      errorPrefix: `Invalid request parameters for tool "${tool.name}"`,
      coerce: true,
      strictAdditionalProperties:
        toolConfig?.inputSchemaAdditionalProperties === false
    })

    return incomingRequestArgs
  } else if (request.method === 'POST') {
    let incomingRequestArgsRaw: unknown = {}

    // TODO: verify content-type of request is application/json

    try {
      incomingRequestArgsRaw = (await request.json()) as Record<string, any>
    } catch (err) {
      // Error if the request body is not JSON or is malformed.
      logger.error('Error parsing incoming request body', request, err)
      throw new HttpError({
        message: 'Invalid request body json',
        statusCode: 400,
        cause: err
      })
    }

    // console.log(
    //   'incomingRequestArgsRaw',
    //   typeof incomingRequestArgsRaw,
    //   request.headers,
    //   incomingRequestArgsRaw
    // )

    // TODO: Proper support for empty params with POST requests
    assert(incomingRequestArgsRaw, 400, 'Invalid empty request body')
    assert(
      typeof incomingRequestArgsRaw === 'object',
      400,
      `Invalid request body: expected type "object", received type "${typeof incomingRequestArgsRaw}"`
    )
    assert(!Array.isArray(incomingRequestArgsRaw), 400, 'Invalid request body')
    return incomingRequestArgsRaw
  } else {
    assert(false, 405, `HTTP method "${request.method}" not allowed`)
  }
}
