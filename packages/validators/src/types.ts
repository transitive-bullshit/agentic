export type ParsedFaasIdentifier = {
  projectId: string
  servicePath: string
  deploymentHash?: string
  deploymentId?: string
  version?: string
} & (
  | {
      deploymentHash: string
      deploymentId: string
    }
  | {
      version: string
    }
)
