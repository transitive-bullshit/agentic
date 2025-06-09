import type { AdminDeployment, PricingPlan } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'
// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { McpAgent } from 'agents/mcp'

import type { RawEnv } from './env'
import type { AdminConsumer } from './types'
import { resolveOriginToolCall } from './resolve-origin-tool-call'
import { transformHttpResponseToMcpToolCallResponse } from './transform-http-response-to-mcp-tool-call-response'

// type State = { counter: number }

export class DurableMcpServer extends McpAgent<
  RawEnv,
  never, // TODO: do we need local state?
  {
    deployment: AdminDeployment
    consumer?: AdminConsumer
    pricingPlan?: PricingPlan
    ip?: string
  }
> {
  protected _serverP = Promise.withResolvers<Server>()
  override server = this._serverP.promise

  // override initialState: State = {
  //   counter: 1
  // }

  override async init() {
    const { consumer, deployment, pricingPlan, ip } = this.props
    const { projectIdentifier } = parseDeploymentIdentifier(
      deployment.identifier
    )

    const server = new Server(
      { name: projectIdentifier, version: deployment.version ?? '0.0.0' },
      {
        capabilities: {
          tools: {}
        }
      }
    )
    this._serverP.resolve(server)

    const tools = deployment.tools
      .map((tool) => {
        const toolConfig = deployment.toolConfigs.find(
          (toolConfig) => toolConfig.name === tool.name
        )

        if (toolConfig) {
          const pricingPlanToolConfig = pricingPlan
            ? toolConfig.pricingPlanConfig?.[pricingPlan.slug]
            : undefined

          if (pricingPlanToolConfig?.enabled === false) {
            // Tool is disabled / hidden for the customer's current pricing plan
            return undefined
          }

          if (!pricingPlanToolConfig?.enabled && !toolConfig.enabled) {
            // Tool is disabled / hidden for all pricing plans
            return undefined
          }
        }

        return tool
      })
      .filter(Boolean)

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools
    }))

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      const tool = tools.find((tool) => tool.name === name)
      assert(tool, 404, `Unknown tool: ${name}`)

      // TODO: Implement tool config logic
      // const toolConfig = deployment.toolConfigs.find(
      //   (toolConfig) => toolConfig.name === tool.name
      // )

      // TODO: rate-limiting
      // TODO: caching
      // TODO: usage tracking / reporting

      const sessionId = this.ctx.id.toString()
      const { toolCallArgs, originRequest, originResponse, toolCallResponse } =
        await resolveOriginToolCall({
          tool,
          args,
          deployment,
          consumer,
          pricingPlan,
          sessionId,
          env: this.env,
          ip,
          waitUntil: this.ctx.waitUntil
        })

      if (originResponse) {
        return transformHttpResponseToMcpToolCallResponse({
          originRequest,
          originResponse,
          tool,
          toolCallArgs
        })
      } else if (toolCallResponse) {
        return toolCallResponse
      } else {
        assert(false, 500)
      }
    })
  }

  // override onStateUpdate(state: State) {
  //   // eslint-disable-next-line no-console
  //   console.log({ stateUpdate: state })
  // }
}
