<p>
  <a href="https://github.com/transitive-bullshit/agentic-platform/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic-platform/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic <!-- omit from toc -->

## TODO

- **webapp**
- end-to-end working examples
  - raw
  - openapi
  - mcp
- stripe
  - re-add coupons
  - declarative json-based pricing
    - like https://github.com/tierrun/tier and Saasify
    - https://github.com/tierrun/tier/blob/main/pricing/schema.json
    - https://blog.tier.run/tier-hello-world-demo
  - stripe connect
- transactional emails
  - (openauth password emails and `sendCode`)
  - stripe-related billing emails
- auth
  - custom auth pages for `openauth`
- re-add support for teams / organizations
- consider switching to [consola](https://github.com/unjs/consola) for logging?
- consider switching to `bun` (for `--hot` reloading!!)
- consider `projectName` and `projectSlug` or `projectIdentifier`?
- for clients and internal packages, importing some types from platform-types and some types from platform-api-client is confusing
  - this actually causes problems because some types from the openapi version aren't compatible with the schema types like `PricingPlan`
  - solved for now; revisit this to clean up in the future
- validate stability of pricing plan slugs across deployments
  - same for pricing plan line-items
- replace `ms` package
- add username / team name blacklist
  - admin, internal, mcp, sse, etc
- **API gateway**
  - share hono middleware and utils across apps/api and apps/gateway
    - or combine these together? ehhhh
  - MCP server vs REST gateway on public and internal sides
    - **REST**: `GET/POST gateway.agentic.so/deploymentIdentifier/toolName`
      - => MCP: `MCPClient.callTool` with JSON body parameters
      - => OpenAPI: `GET/POST/ETC originUrl/toolName` operation with transformed JSON body params
    - **MCP**: `mcp.agentic.so/deploymentIdentifier/sse` MCP server?
      - => MCP: `MCPClient.callTool` just proxying tool call
      - => OpenAPI: `GET/POST/ETC originUrl/toolName` operation with transformed tool params
    - RAW: `METHOD gateway.agentic.so/deploymentIdentifier/<pathname>`
      - => Raw HTTP: `METHOD originUrl/<pathname>` simple HTTP proxy request
  - add support for caching
  - add support for custom headers on responses
  - how to handle binary bodies and responses?
  - signed requests
- revisit deployment identifiers so possibly be URL-friendly?
- move validators package into platform-types?
  - force toolPath to be non-empty except for `raw`?
    - will remove ambiguity from `username/`
  - make namespace optional? and require `@` prefix if so? like npm packages
  - separate `parseToolIdentifier` from `parseDeploymentIdentifier` and `parseProjectIdentifier`?
- `@agentic/platform-hono`
  - fix sentry middleware
    - https://github.com/honojs/middleware/blob/main/packages/sentry/src/index.ts
    - https://github.com/honojs/middleware/issues/943
    - https://github.com/getsentry/sentry-javascript/tree/master/packages/cloudflare

## License

UNLICENSED PROPRIETARY © [Agentic](https://x.com/transitive_bs)

To stay up to date or learn more, follow [@transitive_bs](https://x.com/transitive_bs) on Twitter.
