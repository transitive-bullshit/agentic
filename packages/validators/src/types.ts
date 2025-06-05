export type ParsedToolIdentifier = {
  projectIdentifier: string
  deploymentHash?: string
  deploymentIdentifier?: string
  version?: string

  // TODO: Rename to `toolName`?
  toolPath: string
} & (
  | {
      deploymentHash: string
      deploymentIdentifier: string
    }
  | {
      version: string
    }
)
