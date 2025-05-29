import type { OriginAdapter, Tool, ToolConfig } from '@agentic/platform-schemas'
import { assert } from '@agentic/platform-core'

/**
 * Validates and normalizes the origin adapter config for a project.
 */
export async function validateTools({
  originAdapter,
  tools,
  toolConfigs,
  label
}: {
  originAdapter: OriginAdapter
  tools: Tool[]
  toolConfigs: ToolConfig[]
  label: string
}): Promise<void> {
  assert(tools.length > 0, 400, `No tools defined for ${label}`)

  const toolsMap: Record<string, Tool> = {}
  for (const tool of tools) {
    assert(
      !toolsMap[tool.name],
      400,
      `Duplicate tool name "${tool.name}" found in ${label}`
    )
    toolsMap[tool.name] = tool
  }

  for (const toolConfig of toolConfigs) {
    const tool = toolsMap[toolConfig.name]
    assert(
      tool,
      400,
      `Tool "${toolConfig.name}" from \`toolConfigs\` not found in \`tools\` for ${label}`
    )
  }

  if (originAdapter.type === 'openapi') {
    // TODO
  }
}
