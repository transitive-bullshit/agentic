<p>
  <a href="https://github.com/transitive-bullshit/agentic-platform/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic-platform/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic <!-- omit from toc -->

## API Gateway

- **REST**: `GET/POST gateway.agentic.so/deploymentIdentifier/toolName`
  - => MCP: `MCPClient.callTool` with JSON body parameters
  - => OpenAPI: `GET/POST/ETC originUrl/toolName` operation with transformed JSON body params
- **MCP**: `mcp.agentic.so/deploymentIdentifier` MCP server?
  - => MCP: `MCPClient.callTool` just proxying tool call
  - => OpenAPI: `GET/POST/ETC originUrl/toolName` operation with transformed tool params
- RAW: `METHOD gateway.agentic.so/deploymentIdentifier/<pathname>`
  - => Raw HTTP: `METHOD originUrl/<pathname>` simple HTTP proxy request
  - TODO: remove / disable `raw` support for now

## TODO

- **webapp**
- stripe
  - stripe checkout
  - stripe billing portal
- end-to-end working examples
  - openapi
  - mcp
  - raw
- auth
  - custom auth pages for `openauth`
- **API gateway**
  - **usage tracking and reporting**
  - oauth flow
    - https://docs.scalekit.com/guides/mcp/oauth
  - openapi-kitchen-sink
    - add more test cases to e2e tests
  - mcp-kitchen-sink
  - how to handle binary bodies and responses?
  - improve logger vs console for non-hono path and util methods
  - extra `Sentry` instrumentation (`setUser`, `captureMessage`, etc)
- **Public MCP server interface**
  - how does oauth work with this flow?
  - proper error handling support within this flow; will currently get generic errors
- **Origin MCP servers**
  - how to guarantee that the request is coming from agentic?
    - `_meta` for tool calls
    - _still need a way of doing this for initial connection requests_
  - mcp auth provider support
  - binary bodies / responses?
  - resources
  - prompts
  - other MCP features?

## TODO Post-MVP

- first-party deployment hosting
- api gateway stress tests
- auth
  - custom auth provider configs for projects/deployments
- stripe
  - re-add coupons
  - declarative json-based pricing
    - like https://github.com/tierrun/tier and Saasify
    - https://github.com/tierrun/tier/blob/main/pricing/schema.json
    - https://blog.tier.run/tier-hello-world-demo
  - stripe connect
  - stripe-related billing emails
- re-add support for teams / organizations
- consider switching to [consola](https://github.com/unjs/consola) for logging?
- consider switching to `bun` (for `--hot` reloading!!)
- validate stability of pricing plan slugs across deployments
  - same for pricing plan line-items
- replace `ms` package
- API gateway
  - **do I just ditch the public REST interface and focus on MCP?**
  - SSE support? (no; post-mvp if at all; only support [streamable http](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http) like smithery does, or maybe support both?)
  - signed requests
  - add support for custom headers on responses
  - add ability to only report stripe usage on non-cached requests
  - add support for ToolConfig.cost defaulting to 1, to easily support tools which cost multiple "credits"
- `@agentic/platform-hono`
  - fix sentry middleware
    - https://github.com/honojs/middleware/blob/main/packages/sentry/src/index.ts
    - https://github.com/honojs/middleware/issues/943
    - https://github.com/getsentry/sentry-javascript/tree/master/packages/cloudflare
- additional transactional emails
- consider `projectName` and `projectSlug` or `projectIdentifier`?
- handle or validate against dynamic MCP origin tools
- allow config name to be `project-name` or `@namespace/project-name`?
- upgrade to zod v4

## License

UNLICENSED PROPRIETARY © [Agentic](https://x.com/transitive_bs)

To stay up to date or learn more, follow [@transitive_bs](https://x.com/transitive_bs) on Twitter.
