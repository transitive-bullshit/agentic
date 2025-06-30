<p align="center">
  <a href="https://agentic.so/publishing">
    <img alt="Agentic" src="/apps/web/public/agentic-publishing-social-image-dark-github.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/platform-types"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/platform-types.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# @agentic/platform-types <!-- omit from toc -->

> Core schemas and types shared across the Agentic platform.

- [Website](https://agentic.so/publishing)
- [Docs](https://docs.agentic.so)

> [!TIP]
> You likely don't need this package directly. See [@agentic/cli](https://github.com/transitive-bullshit/agentic/tree/main/packages/cli), [@agentic/platform](https://github.com/transitive-bullshit/agentic/tree/main/packages/platform), and [@agentic/platform-tool-client](https://github.com/transitive-bullshit/agentic/tree/main/packages/platform-tool-client) for more public-facing packages.

## Install

```bash
npm i @agentic/platform-types
```

## Usage

```ts
import {
  agenticProjectConfigSchema,
  type AgenticProjectConfigInput,
  resolvedAgenticProjectConfigSchema,
  type ResolvedAgenticProjectConfig,
  type User,
  type Project,
  type Deployment,
  type Consumer,
  type AdminMcpRequestMetadata
  // etc...
} from '@agentic/platform-types'
```

## Notes

Some types are raw TS, some are derived from zod schemas, and most of the core database models are inferred from a generated OpenAPI spec exposed by Agentic's backend API.

## License

[GNU AGPL 3.0](https://choosealicense.com/licenses/agpl-3.0/)
