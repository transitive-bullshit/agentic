import type { AdminDeployment, PricingPlan } from '@agentic/platform-types'
import { assert, getRateLimitHeaders } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'
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
            ? toolConfig.pricingPlanOverridesMap?.[pricingPlan.slug]
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

      try {
        assert(tool, 404, `Unknown tool "${name}"`)

        // TODO: usage tracking / reporting

        const sessionId = this.ctx.id.toString()
        const {
          toolCallArgs,
          originRequest,
          originResponse,
          toolCallResponse,
          rateLimitResult
        } = await resolveOriginToolCall({
          tool,
          args,
          deployment,
          consumer,
          pricingPlan,
          sessionId,
          env: this.env,
          ip,
          waitUntil: this.ctx.waitUntil.bind(this.ctx)
        })

        if (originResponse) {
          return transformHttpResponseToMcpToolCallResponse({
            originRequest,
            originResponse,
            tool,
            toolCallArgs,
            rateLimitResult
          })
        } else if (toolCallResponse) {
          if (toolCallResponse._meta || rateLimitResult) {
            return {
              ...toolCallResponse,
              _meta: {
                ...toolCallResponse._meta,
                ...(rateLimitResult
                  ? getRateLimitHeaders(rateLimitResult)
                  : undefined)
              }
            }
          } else {
            return toolCallResponse
          }
        } else {
          assert(false, 500)
        }
      } catch (err: unknown) {
        // TODO: handle errors
        // eslint-disable-next-line no-console
        console.error(err)
        throw err
      } finally {
        // TODO: report usage
      }
    })
  }
}
