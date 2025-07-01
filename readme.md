<p align="center">
  <a href="https://agentic.so">
    <img alt="Agentic" src="https://raw.githubusercontent.com/transitive-bullshit/agentic/main/apps/web/public/agentic-social-image-light.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic <!-- omit from toc -->

You can think of Agentic as **RapidAPI for LLM tools**.

All tools listed on Agentic's marketplace have been carefully hand curated and are regularly tested with a comprehensive set of integration tests and evals. **Agentic aims for quality, not quantity**.

On the flip side, Agentic makes it easy to **publish your own MCP servers & OpenAPI services** to Agentic's MCP Gateway and instantly start charging for agentic tool use.

- [Website](https://agentic.so)
- [Docs](https://docs.agentic.so)

## Key features

- **Highly Curated Tools**: All publicly listed Agentic tools are manually vetted to keep an extremely high quality bar.
- **Agentic UX**: All Agentic tools have been hand-crafted specifically for LLM tool use. We call this Agentic UX, and it's at the heart of why Agentic tools work better for LLM & MCP use cases than legacy APIs.
- **First-Class MCP Support**: On both the publishing and consumption sides, Agentic supports MCP as a truly first-class primitive – not an afterthought.
- **World-Class TypeScript DX**: Agentic is written in TS and strives for a Vercel-like DX, including one-line integrations with every major TS LLM SDK.
- **Stripe Billing**: Agentic uses Stripe for billing, and most tools are _usage-based_, so you'll only pay for what you (and your agents) actually use.
- **Blazing Fast MCP Gateway**: Agentic's MCP gateway is powered by _Cloudflare's global edge network_. Tools come with customizable caching and rate-limits, so you can REST assured that your agents will always have a fast and reliable experience.
- **Semver**: All Agentic tools are versioned using semver, so you can choose how to handle breaking changes.

## Getting started

- [MCP Marketplace](https://docs.agentic.so/marketplace) - Using tools
- [MCP Publishing](https://docs.agentic.so/publishing/quickstart) - Publishing your own tools

### TypeScript LLM SDKs

Agentic has first-class support for every major TS LLM SDK, including:

- [Vercel AI SDK](https://docs.agentic.so/marketplace/ts-sdks/ai-sdk)
- [OpenAI](https://docs.agentic.so/marketplace/ts-sdks/openai-chat)
- [LangChain](https://docs.agentic.so/marketplace/ts-sdks/langchain)
- [LlamaIndex](https://docs.agentic.so/marketplace/ts-sdks/llamaindex)
- [Firebase Genkit](https://docs.agentic.so/marketplace/ts-sdks/genkit)
- [Mastra](https://docs.agentic.so/marketplace/ts-sdks/mastra)

## Publish your own MCP products

<p align="center">
  <a href="https://agentic.so/publishing">
    <img alt="Agentic" src="https://raw.githubusercontent.com/transitive-bullshit/agentic/main/apps/web/public/agentic-publishing-social-image-dark-github.jpg" width="640">
  </a>
</p>

- [Learn more about publishing with Agentic](https://agentic.so/publishing)
- [Publish an existing MCP server with Agentic](https://docs.agentic.so/publishing/guides/existing-mcp-server)
- [Publish an existing OpenAPI service with Agentic](https://docs.agentic.so/publishing/guides/existing-openapi-service)

Anyone can publish their own live MCP products with Agentic, but you'll need to submit your MCP to us before it can be listed on the main Agentic marketplace.

## Join the community

- Follow us on [Twitter](https://x.com/transitive_bs)
- Read more in our [docs](https://docs.agentic.so)

## Contributing

**Agentic is proudly 100% open source.**

Interested in contributing or building Agentic from scratch? See [contributing.md](./contributing.md).
