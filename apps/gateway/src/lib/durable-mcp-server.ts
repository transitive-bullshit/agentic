import { assert, getRateLimitHeaders } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import * as Sentry from '@sentry/cloudflare'
import { McpAgent } from 'agents/mcp'

import type { RawEnv } from './env'
import type {
  McpToolCallResponse,
  ResolvedMcpEdgeRequest,
  ResolvedOriginToolCallResult
} from './types'
import { handleMcpToolCallError } from './handle-mcp-tool-call-error'
import { recordToolCallUsage } from './record-tool-call-usage'
import { resolveOriginToolCall } from './resolve-origin-tool-call'
import { transformHttpResponseToMcpToolCallResponse } from './transform-http-response-to-mcp-tool-call-response'
import { createAgenticMcpMetadata } from './utils'

export class DurableMcpServerBase extends McpAgent<
  RawEnv,
  never, // We aren't currently using local state, so set it to `never`.
  ResolvedMcpEdgeRequest
> {
  protected _serverP = Promise.withResolvers<Server>()
  override server = this._serverP.promise

  // NOTE: This empty constructor is required for the Sentry wrapper to work.
  public constructor(state: DurableObjectState, env: RawEnv) {
    super(state, env)
  }

  override async init() {
    const { consumer, deployment, pricingPlan } = this.props
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
          const pricingPlanToolOverride = pricingPlan
            ? toolConfig.pricingPlanOverridesMap?.[pricingPlan.slug]
            : undefined

          if (pricingPlanToolOverride?.enabled === true) {
            // Tool is explicitly enabled for the customer's pricing plan
          } else if (pricingPlanToolOverride?.enabled === false) {
            // Tool is disabled for the customer's pricing plan
            return undefined
          } else if (toolConfig.enabled === false) {
            // Tool is disabled for all pricing plans
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
      const { name: toolName, arguments: args, _meta } = request.params
      const sessionId = this.ctx.id.toString()
      const tool = tools.find((tool) => tool.name === toolName)

      const cacheControl = (_meta?.agentic as any)?.headers?.['cache-control']
      let resolvedOriginToolCallResult: ResolvedOriginToolCallResult | undefined
      let toolCallResponse: McpToolCallResponse | undefined

      try {
        assert(tool, 404, `Unknown tool "${toolName}"`)

        resolvedOriginToolCallResult = await resolveOriginToolCall({
          ...this.props,
          tool,
          args,
          cacheControl,
          sessionId,
          env: this.env,
          waitUntil: this.ctx.waitUntil.bind(this.ctx)
        })

        if (resolvedOriginToolCallResult.originResponse) {
          toolCallResponse = await transformHttpResponseToMcpToolCallResponse({
            ...resolvedOriginToolCallResult,
            tool
          })
        } else {
          toolCallResponse = resolvedOriginToolCallResult.toolCallResponse
          assert(toolCallResponse, 500, 'Missing tool call response')
        }

        return toolCallResponse
      } catch (err: unknown) {
        // Gracefully handle tool call exceptions, whether they were thrown by
        // the origin server or internally by the gateway.
        toolCallResponse = handleMcpToolCallError(err, {
          toolName,
          env: this.env
        })

        return toolCallResponse
      } finally {
        assert(toolCallResponse, 500, 'Missing tool call response')

        // Augment the MCP tool call response with agentic metadata, which
        // makes it easier to debug tool calls and adds some much-needed HTTP
        // header-like functionality to tool call responses.
        toolCallResponse._meta = createAgenticMcpMetadata(
          {
            deploymentId: deployment.id,
            consumerId: consumer?.id,
            toolName,
            cacheStatus: resolvedOriginToolCallResult?.cacheStatus,
            headers: getRateLimitHeaders(
              resolvedOriginToolCallResult?.rateLimitResult
            )
          },
          toolCallResponse._meta
        )

        // Record tool call usage, whether the call was successful or not.
        recordToolCallUsage({
          ...this.props,
          edgeRequestMode: 'mcp',
          tool,
          mcpToolCallResponse: toolCallResponse!,
          resolvedOriginToolCallResult,
          sessionId,
          env: this.env,
          waitUntil: this.ctx.waitUntil.bind(this.ctx)
        })
      }
    })
  }
}

export const DurableMcpServer = Sentry.instrumentDurableObjectWithSentry(
  (env: RawEnv) => ({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT,
    integrations: [Sentry.extraErrorDataIntegration()]
  }),
  DurableMcpServerBase
)
