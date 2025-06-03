import type { Deployment, Tool } from '@agentic/platform-types'
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

  let tool = deployment.tools.find((tool) => tool.name === toolName)

  if (!tool) {
    if (deployment.originAdapter.type === 'openapi') {
      const operationToolName = Object.entries(
        deployment.originAdapter.toolToOperationMap
      ).find(([_, operation]) => {
        if (operation.operationId === toolName) {
          return true
        }

        return false
      })?.[0]

      if (operationToolName) {
        tool = deployment.tools.find((tool) => tool.name === operationToolName)
      }
      assert(
        tool,
        404,
        `Tool not found "${toolName}" for deployment "${deployment.identifier}": did you mean "${operationToolName}"?`
      )
    }
  }

  assert(
    tool,
    404,
    `Tool not found "${toolName}" for deployment "${deployment.identifier}"`
  )

  if (deployment.originAdapter.type === 'openapi') {
    const operation = deployment.originAdapter.toolToOperationMap[tool.name]
    assert(
      operation,
      404,
      `OpenAPI operation not found for tool "${tool.name}"`
    )
    assert(
      method === 'GET' || method === 'POST',
      405,
      `Invalid HTTP method "${method}" for tool "${tool.name}"`
    )

    return {
      ...tool,
      operation
    }
  }

  return tool
}
