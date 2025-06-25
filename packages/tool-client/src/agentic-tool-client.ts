import type { Deployment, Project } from '@agentic/platform-types'
import {
  AIFunctionSet,
  AIFunctionsProvider,
  createAIFunction,
  createJsonSchema
} from '@agentic/core'
import { AgenticApiClient } from '@agentic/platform-api-client'
import { assert } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'
import defaultKy, { type KyInstance } from 'ky'

/**
 * Agentic tool client which makes it easy to use an Agentic tools product with
 * all of the major TypeScript LLM SDKs.
 *
 * @example
 * ```ts
 * const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')
 * ```
 */
export class AgenticToolClient extends AIFunctionsProvider {
  readonly project: Project
  readonly deployment: Deployment
  readonly agenticGatewayBaseUrl: string
  readonly ky: KyInstance

  protected constructor({
    project,
    deployment,
    deploymentIdentifier,
    agenticGatewayBaseUrl,
    ky
  }: {
    project: Project
    deployment: Deployment
    deploymentIdentifier: string
    agenticGatewayBaseUrl: string
    ky: KyInstance
  }) {
    super()

    // TODO: add support for optional apiKey

    this.project = project
    this.deployment = deployment
    this.agenticGatewayBaseUrl = agenticGatewayBaseUrl
    this.ky = ky

    this._functions = new AIFunctionSet(
      deployment.tools.map((tool) => {
        return createAIFunction({
          name: tool.name,
          description: tool.description ?? '',
          inputSchema: createJsonSchema(tool.inputSchema),
          execute: async (json) => {
            return ky
              .post(
                `${agenticGatewayBaseUrl}/${deploymentIdentifier}/${tool.name}`,
                {
                  json
                }
              )
              .json()
          }
        })
      })
    )
  }

  override get functions(): AIFunctionSet {
    assert(this._functions)
    return this._functions
  }

  async callTool(toolName: string, args: string | Record<string, any>) {
    const tool = this.functions.get(toolName)
    assert(tool, `Tool "${toolName}" not found`)
    return tool(typeof args === 'string' ? args : JSON.stringify(args))
  }

  /**
   * Creates an Agentic tool client from a project or deployment identifier.
   *
   * You'll generally use a project identifier, which will automatically use
   * that project's `latest` deployment, but if you want to target a specific
   * version or preview deployment, you can use a fully-qualified deployment
   * identifier.
   *
   * @example
   * ```ts
   * const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')
   * ```
   */
  static async fromIdentifier(
    projectOrDeploymentIdentifier: string,
    {
      agenticApiClient = new AgenticApiClient(),
      agenticGatewayBaseUrl = 'https://gateway.agentic.so',
      ky = defaultKy
    }: {
      agenticApiClient?: AgenticApiClient
      agenticGatewayBaseUrl?: string
      ky?: KyInstance
    } = {}
  ): Promise<AgenticToolClient> {
    const { projectIdentifier, deploymentIdentifier, deploymentVersion } =
      parseDeploymentIdentifier(projectOrDeploymentIdentifier, {
        strict: false
      })

    const [project, rawDeployment] = await Promise.all([
      agenticApiClient.getPublicProjectByIdentifier({
        projectIdentifier,
        populate:
          deploymentVersion === 'latest' ? ['lastPublishedDeployment'] : []
      }),

      // Only make 1 API call in the 95% case where the deployment version is
      // set to the default value of `latest`.
      deploymentVersion === 'latest'
        ? Promise.resolve(undefined)
        : agenticApiClient.getPublicDeploymentByIdentifier({
            deploymentIdentifier
          })
    ])

    const deployment =
      deploymentVersion === 'latest'
        ? project?.lastPublishedDeployment
        : rawDeployment

    assert(project, `Project "${projectIdentifier}" not found`)
    assert(deployment, `Deployment "${deploymentIdentifier}" not found`)

    return new AgenticToolClient({
      project,
      deployment,
      deploymentIdentifier,
      agenticGatewayBaseUrl,
      ky
    })
  }
}
