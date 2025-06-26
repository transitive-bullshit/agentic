import type { Simplify } from 'type-fest'

export type ParseIdentifierOptions = {
  strict?: boolean
  errorStatusCode?: number
}

export type ParsedProjectIdentifier = {
  projectIdentifier: string
  projectNamespace: string
  projectSlug: string
}

export type ParsedDeploymentIdentifier = Simplify<
  ParsedProjectIdentifier & {
    deploymentIdentifier: string
    deploymentHash?: string
    deploymentVersion?: string
  } & (
      | {
          deploymentHash: string
        }
      | {
          deploymentVersion: string
        }
    )
>

export type ParsedToolIdentifier = Simplify<
  ParsedDeploymentIdentifier & {
    toolName: string
  }
>
