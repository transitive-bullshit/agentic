import type { AdminDeployment, Tool } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'

export function getTool({
  toolName,
  deployment,
  method,
  strict = false
}: {
  toolName: string
  deployment: AdminDeployment
  method?: string
  strict?: boolean
}): Tool {
  assert(toolName, 404, `Invalid input empty tool name`)

  let tool = deployment.tools.find((tool) => tool.name === toolName)

  if (!tool && !strict) {
    if (deployment.origin.type === 'openapi') {
      // Check if the tool name is an operation ID since it's easy to forget
      // and mistake the two (`getPost` vs `get_post`).
      // TODO: In the future, we should be consistent about how we handle tool
      // names. Do we always allow camelCase and snake_case, or do we just allow
      // alternates for operationIds? We should also make sure alternates are
      // uniquely defined.
      const operationToolName = Object.entries(
        deployment.origin.toolToOperationMap
      ).find(([_, operation]) => {
        if (operation.operationId === toolName) {
          return true
        }

        return false
      })?.[0]

      if (operationToolName) {
        tool = deployment.tools.find((tool) => tool.name === operationToolName)

        assert(
          tool,
          404,
          `Tool not found "${toolName}" for deployment "${deployment.identifier}": did you mean "${operationToolName}"?`
        )
      }
    }
  }

  assert(
    tool,
    404,
    `Tool not found "${toolName}" for deployment "${deployment.identifier}"`
  )

  if (deployment.origin.type === 'openapi') {
    const operation = deployment.origin.toolToOperationMap[tool.name]
    assert(
      operation,
      404,
      `OpenAPI operation not found for tool "${tool.name}"`
    )
    if (method) {
      assert(
        method === 'GET' || method === 'POST',
        405,
        `Invalid HTTP method "${method}" for tool "${tool.name}"`
      )
    }
  }

  return tool
}
