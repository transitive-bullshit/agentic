import type { OriginAdapter, Tool, ToolConfig } from '@agentic/platform-schemas'
import { assert } from '@agentic/platform-core'

/**
 * Validates the origin server's tools for a project.
 */
export function validateTools({
  originAdapter,
  tools,
  toolConfigs,
  label
}: {
  originAdapter: OriginAdapter
  tools: Tool[]
  toolConfigs: ToolConfig[]
  label: string
}) {
  if (!tools.length) {
    assert(
      originAdapter.type === 'raw',
      `No tools defined for ${label} with origin adapter type "${originAdapter.type}"`
    )
  }

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
}
