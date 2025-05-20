export type ParsedFaasIdentifier = {
  projectIdentifier: string
  servicePath: string
  deploymentHash?: string
  deploymentIdentifier?: string
  version?: string
} & (
  | {
      deploymentHash: string
      deploymentIdentifier: string
    }
  | {
      version: string
    }
)
