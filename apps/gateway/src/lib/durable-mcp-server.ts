import type { AdminDeployment, PricingPlan } from '@agentic/platform-types'
import type { JSONRPCRequest } from '@modelcontextprotocol/sdk/types.js'
import { assert } from '@agentic/platform-core'
// import { parseDeploymentIdentifier } from '@agentic/platform-validators'
// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { DurableObject } from 'cloudflare:workers'

import type { RawEnv } from './env'
import type { AdminConsumer } from './types'

export class DurableMcpServer extends DurableObject<RawEnv> {
  // TODO: store this in storage?
  protected _initData?: {
    deployment: AdminDeployment
    consumer?: AdminConsumer
    pricingPlan?: PricingPlan
  }

  async init({
    deployment,
    consumer,
    pricingPlan
  }: {
    deployment: AdminDeployment
    consumer?: AdminConsumer
    pricingPlan?: PricingPlan
  }) {
    // const parsedDeploymentIdentifier = parseDeploymentIdentifier(
    //   deployment.identifier
    // )
    // assert(
    //   parsedDeploymentIdentifier,
    //   500,
    //   `Invalid deployment identifier "${deployment.identifier}"`
    // )
    // const { projectIdentifier } = parsedDeploymentIdentifier

    // const server = new McpServer({
    //   name: projectIdentifier,
    //   version: deployment.version ?? '0.0.0'
    // })
    // const transport = new StreamableHTTPServerTransport({})
    // server.addTransport(transport)

    this._initData = {
      deployment,
      consumer,
      pricingPlan
    }
  }

  async isInitialized() {
    return this._initData
  }

  async sayHello(name: string): Promise<string> {
    assert(this._initData, 500, 'Server not initialized')
    return `Hello, ${name}!`
  }

  async onRequest(request: JSONRPCRequest) {
    const { method, params } = request
  }
}
