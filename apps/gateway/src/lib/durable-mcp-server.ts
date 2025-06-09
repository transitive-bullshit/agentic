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
import type {
  AdminConsumer,
  AgenticMcpRequestMetadata,
  McpToolCallResponse
} from './types'
import { cfValidateJsonSchema } from './cf-validate-json-schema'
import { createRequestForOpenAPIOperation } from './create-request-for-openapi-operation'
import { transformHttpResponseToMcpToolCallResponse } from './transform-http-response-to-mcp-tool-call-response'
// import { fetchCache } from './fetch-cache'
// import { getRequestCacheKey } from './get-request-cache-key'
import { updateOriginRequest } from './update-origin-request'

// type State = { counter: number }

export class DurableMcpServer extends McpAgent<
  RawEnv,
  never, // TODO: do we need local state?
  {
    deployment: AdminDeployment
    consumer?: AdminConsumer
    pricingPlan?: PricingPlan
  }
> {
  protected _serverP = Promise.withResolvers<Server>()
  override server = this._serverP.promise

  // override initialState: State = {
  //   counter: 1
  // }

  override async init() {
    const { consumer, deployment, pricingPlan } = this.props
    const { originAdapter } = deployment
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

      if (originAdapter.type === 'raw') {
        // TODO
        assert(false, 500, 'Raw origin adapter not implemented')
      } else {
        // Validate incoming request params against the tool's input schema.
        const toolCallArgs = cfValidateJsonSchema<Record<string, any>>({
          schema: tool.inputSchema,
          data: args,
          errorMessage: `Invalid request parameters for tool "${tool.name}"`,
          strictAdditionalProperties: true
        })

        if (originAdapter.type === 'openapi') {
          const operation = originAdapter.toolToOperationMap[tool.name]
          assert(
            operation,
            404,
            `Tool "${tool.name}" not found in OpenAPI spec`
          )
          assert(toolCallArgs, 500)

          const originRequest = await createRequestForOpenAPIOperation({
            toolCallArgs,
            operation,
            deployment
          })

          updateOriginRequest(originRequest, { consumer, deployment })

          // TODO: re-add caching support
          // const cacheKey = await getRequestCacheKey(ctx, originRequest)

          // // TODO: transform origin 5XX errors to 502 errors...
          // // TODO: fetch origin request and transform response
          // const originResponse = await fetchCache(ctx, {
          //   cacheKey,
          //   fetchResponse: () => fetch(originRequest)
          // })

          const originResponse = await fetch(originRequest)

          return transformHttpResponseToMcpToolCallResponse({
            originRequest,
            originResponse,
            tool,
            toolCallArgs
          })
        } else if (originAdapter.type === 'mcp') {
          const sessionId = this.ctx.id.toString()
          const id: DurableObjectId =
            this.env.DO_MCP_CLIENT.idFromName(sessionId)
          const originMcpClient = this.env.DO_MCP_CLIENT.get(id)

          await originMcpClient.init({
            url: deployment.originUrl,
            name: originAdapter.serverInfo.name,
            version: originAdapter.serverInfo.version
          })

          const { projectIdentifier } = parseDeploymentIdentifier(
            deployment.identifier,
            { errorStatusCode: 500 }
          )

          const originMcpRequestMetadata = {
            agenticProxySecret: deployment._secret,
            sessionId,
            // ip,
            isCustomerSubscriptionActive:
              !!consumer?.isStripeSubscriptionActive,
            customerId: consumer?.id,
            customerSubscriptionPlan: consumer?.plan,
            customerSubscriptionStatus: consumer?.stripeStatus,
            userId: consumer?.user.id,
            userEmail: consumer?.user.email,
            userUsername: consumer?.user.username,
            userName: consumer?.user.name,
            userCreatedAt: consumer?.user.createdAt,
            userUpdatedAt: consumer?.user.updatedAt,
            deploymentId: deployment.id,
            deploymentIdentifier: deployment.identifier,
            projectId: deployment.projectId,
            projectIdentifier
          } as AgenticMcpRequestMetadata

          // TODO: add timeout support to the origin tool call?
          // TODO: add response caching for MCP tool calls
          const toolCallResponseString = await originMcpClient.callTool({
            name: tool.name,
            args: toolCallArgs,
            metadata: originMcpRequestMetadata!
          })
          const toolCallResponse = JSON.parse(
            toolCallResponseString
          ) as McpToolCallResponse

          return toolCallResponse
        } else {
          assert(false, 500)
        }
      }
    })
  }

  // override onStateUpdate(state: State) {
  //   // eslint-disable-next-line no-console
  //   console.log({ stateUpdate: state })
  // }
}
