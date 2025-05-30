import type { Deployment } from '@agentic/platform-api-client'
import type { Tool } from '@agentic/platform-schemas'
import { assert } from '@agentic/platform-core'

export function getTool({
  method,
  deployment,
  toolPath
}: {
  method: string
  deployment: Deployment
  toolPath: string
}): Tool {
  const toolName = toolPath
    .replaceAll(/^\//g, '')
    .replaceAll(/\/$/g, '')
    .split('/')
    .at(-1)
  assert(toolName, 404, `Invalid tool path "${toolPath}"`)

  const tool = deployment.tools.find((tool) => {
    if (tool.name === toolName) {
      return true
    }

    return false
  })

  assert(tool, 404, `Tool not found "${toolPath}"`)
  if (deployment.originAdapter.type === 'openapi') {
    const operation = deployment.originAdapter.toolToOperationMap[tool.name]
    assert(
      operation,
      404,
      `OpenAPI operation not found for tool "${tool.name}"`
    )
    assert(
      operation.method.toUpperCase() === method.toUpperCase(),
      405,
      `Invalid HTTP method "${method.toUpperCase()}" for tool "${tool.name}"`
    )

    return {
      ...tool,
      operation
    }
  }

  return tool
}
