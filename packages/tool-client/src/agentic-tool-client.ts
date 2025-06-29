import type { Deployment, Project } from '@agentic/platform-types'
import {
  AIFunctionSet,
  AIFunctionsProvider,
  createAIFunction,
  createJsonSchema,
  getEnv
} from '@agentic/core'
import { AgenticApiClient } from '@agentic/platform-api-client'
import { assert } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'
import defaultKy, { type KyInstance } from 'ky'

export type AgenticToolClientOptions = {
  /**
   * Optional API key for your subscription to the Agentic project.
   *
   * If not set, will default to the `AGENTIC_API_KEY` environment variable.
   *
   * If no `apiKey` is set, the client will make unauthenticated tool calls,
   * which may or may not be supported by the target Agentic project.
   */
  apiKey?: string

  /**
   * Optional custom Agentic API client.
   */
  agenticApiClient?: AgenticApiClient

  /**
   * Optional custom Agentic Gateway base URL.
   *
   * @default `https://gateway.agentic.so`
   */
  agenticGatewayBaseUrl?: string

  /**
   * Optional custom Ky instance.
   *
   * Useful for overriding the default headers, retry logic, etc.
   */
  ky?: KyInstance
}

/**
 * Agentic tool client which makes it easy to use an Agentic tool products with
 * all of the major TypeScript LLM SDKs, without having to go through any MCP
 * middleware.
 *
 * The resulting tool client will make simple HTTP calls to the Agentic Gateway
 * to execute tools.
 *
 * @example
 * ```ts
 * const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')
 * ```
 */
export class AgenticToolClient extends AIFunctionsProvider {
  readonly apiKey: string | undefined
  readonly project: Project
  readonly deployment: Deployment
  readonly agenticGatewayBaseUrl: string
  readonly ky: KyInstance

  protected constructor({
    apiKey,
    project,
    deployment,
    deploymentIdentifier,
    agenticGatewayBaseUrl,
    ky
  }: {
    apiKey: string | undefined
    project: Project
    deployment: Deployment
    deploymentIdentifier: string
    agenticGatewayBaseUrl: string
    ky: KyInstance
  }) {
    super()

    this.apiKey = apiKey
    this.project = project
    this.deployment = deployment
    this.agenticGatewayBaseUrl = agenticGatewayBaseUrl
    this.ky = apiKey
      ? ky.extend({ headers: { Authorization: `Bearer ${apiKey}` } })
      : ky

    this._functions = new AIFunctionSet(
      deployment.tools.map((tool) => {
        return createAIFunction({
          name: tool.name,
          description: tool.description ?? '',
          inputSchema: createJsonSchema(tool.inputSchema),
          // TODO: we should make sure all agentic tools support OpenAI strict
          // mode by default.
          strict: false,
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

  /**
   * Helper method to call a tool with either raw or stringified JSON arguments.
   */
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
      apiKey = getEnv('AGENTIC_API_KEY'),
      agenticApiClient = new AgenticApiClient(),
      agenticGatewayBaseUrl = 'https://gateway.agentic.so',
      ky = defaultKy
    }: AgenticToolClientOptions = {}
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
      apiKey,
      project,
      deployment,
      deploymentIdentifier,
      agenticGatewayBaseUrl,
      ky
    })
  }
}
