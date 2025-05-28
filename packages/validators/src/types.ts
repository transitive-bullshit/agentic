export type ParsedFaasIdentifier = {
  projectIdentifier: string
  toolPath: string
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
