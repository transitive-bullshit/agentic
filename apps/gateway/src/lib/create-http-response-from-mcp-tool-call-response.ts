import type { AdminDeployment, Tool, ToolConfig } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'

import type { GatewayHonoContext, McpToolCallResponse } from './types'
import { cfValidateJsonSchema } from './cf-validate-json-schema'

export async function createHttpResponseFromMcpToolCallResponse(
  _ctx: GatewayHonoContext,
  {
    tool,
    deployment,
    toolCallResponse,
    toolConfig
  }: {
    tool: Tool
    deployment: AdminDeployment
    toolCallResponse: McpToolCallResponse
    toolConfig?: ToolConfig
  }
): Promise<Response> {
  assert(
    deployment.origin.type === 'mcp',
    500,
    `Internal logic error for origin adapter type "${deployment.origin.type}"`
  )
  assert(
    !toolCallResponse.isError,
    502,
    // TODO: add content or structuredContent to the error message
    `MCP tool "${tool.name}" returned an error.`
  )

  if (tool.outputSchema) {
    // eslint-disable-next-line no-console
    console.log(`tool call "${tool.name}" structured response:`, {
      outputSchema: tool.outputSchema,
      toolCallResponse
    })

    assert(
      toolCallResponse.structuredContent,
      502,
      `Structured content is required for MCP origin requests to tool "${tool.name}" because it has an output schema.`
    )

    // Validate tool response against the tool's output schema.
    const toolCallResponseContent = cfValidateJsonSchema({
      schema: tool.outputSchema,
      data: toolCallResponse.structuredContent as Record<string, unknown>,
      coerce: false,
      // TODO: double-check MCP schema on whether additional properties are allowed
      strictAdditionalProperties:
        toolConfig?.outputSchemaAdditionalProperties === false,
      errorPrefix: `Invalid tool response for tool "${tool.name}"`,
      errorStatusCode: 502
    })

    return new Response(JSON.stringify(toolCallResponseContent), {
      headers: {
        'content-type': 'application/json'
      }
    })
  }

  return new Response(JSON.stringify(toolCallResponse.content), {
    headers: {
      'content-type': 'application/json'
    }
  })
}
