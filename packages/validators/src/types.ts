export type ParsedFaasIdentifier = {
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
