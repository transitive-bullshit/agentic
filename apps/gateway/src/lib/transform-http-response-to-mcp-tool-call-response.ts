import type { Tool, ToolConfig } from '@agentic/platform-types'
import { assert, HttpError } from '@agentic/platform-core'
import contentType from 'fast-content-type-parse'

import type { McpToolCallResponse, ToolCallArgs } from './types'
import { cfValidateJsonSchema } from './cf-validate-json-schema'

export async function transformHttpResponseToMcpToolCallResponse({
  originRequest,
  originResponse,
  tool,
  toolCallArgs,
  toolConfig
}: {
  originRequest: Request
  originResponse: Response
  tool: Tool
  toolCallArgs: ToolCallArgs
  toolConfig?: ToolConfig
}) {
  const { type: mimeType } = contentType.safeParse(
    originResponse.headers.get('content-type') || 'application/octet-stream'
  )

  // TODO: move these logs should be higher up
  // eslint-disable-next-line no-console
  console.log('httpOriginResponse', {
    tool: tool.name,
    toolCallArgs,
    url: originRequest.url,
    method: originRequest.method,
    originResponse: {
      mimeType,
      status: originResponse.status
      // headers: Object.fromEntries(originResponse.headers.entries())
    }
  })

  if (originResponse.status >= 400) {
    let message = originResponse.statusText
    try {
      message = await originResponse.text()
    } catch {}

    // eslint-disable-next-line no-console
    console.error('httpOriginResponse ERROR', {
      tool: tool.name,
      toolCallArgs,
      url: originRequest.url,
      method: originRequest.method,
      originResponse: {
        mimeType,
        status: originResponse.status,
        // headers: Object.fromEntries(originResponse.headers.entries()),
        message
      }
    })

    throw new HttpError({
      statusCode: originResponse.status,
      message,
      cause: originResponse
    })
  }

  const result: McpToolCallResponse = {
    isError: originResponse.status >= 400
  }

  if (tool.outputSchema) {
    assert(
      mimeType.includes('json'),
      502,
      `Tool "${tool.name}" requires a JSON response, but the origin returned content type "${mimeType}"`
    )
    const data = (await originResponse.json()) as Record<string, unknown>

    const toolCallResponseContent = cfValidateJsonSchema({
      data,
      schema: tool.outputSchema,
      coerce: false,
      strictAdditionalProperties:
        toolConfig?.outputSchemaAdditionalProperties === false,
      errorPrefix: `Invalid tool response for tool "${tool.name}"`,
      errorStatusCode: 502
    })

    result.structuredContent = toolCallResponseContent
  } else {
    if (mimeType.includes('json')) {
      result.structuredContent = await originResponse.json()
    } else if (mimeType.includes('text')) {
      result.content = [
        {
          type: 'text',
          text: await originResponse.text()
        }
      ]
    } else {
      const resBody = await originResponse.arrayBuffer()
      const resBodyBase64 = Buffer.from(resBody).toString('base64')
      const type = mimeType.includes('image')
        ? 'image'
        : mimeType.includes('audio')
          ? 'audio'
          : 'resource'

      // TODO: this needs work
      result.content = [
        {
          type,
          mimeType,
          ...(type === 'resource'
            ? {
                blob: resBodyBase64
              }
            : {
                data: resBodyBase64
              })
        }
      ]
    }
  }

  return result
}
