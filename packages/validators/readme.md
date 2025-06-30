<p align="center">
  <a href="https://agentic.so/publishing">
    <img alt="Agentic" src="/apps/web/public/agentic-publishing-social-image-dark-github.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/platform-validators"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/platform-validators.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# @agentic/platform-validators <!-- omit from toc -->

> Core schemas and validators shared across the Agentic platform.

- [Website](https://agentic.so/publishing)
- [Docs](https://docs.agentic.so)

> [!TIP]
> You likely don't need this package directly. See [@agentic/cli](https://github.com/transitive-bullshit/agentic/tree/main/packages/cli), [@agentic/platform](https://github.com/transitive-bullshit/agentic/tree/main/packages/platform), and [@agentic/platform-tool-client](https://github.com/transitive-bullshit/agentic/tree/main/packages/platform-tool-client) for more public-facing packages.

## Install

```bash
npm i @agentic/platform-validators
```

## Usage

```ts
import { parseProjectIdentifier } from '@agentic/platform-validators'

const parsedProjectIdentifier = parseProjectIdentifier('@agentic/search')
```

## Identifiers

### Project Identifier

- `@username/project-slug`
- `@team-slug/project-slug`

**Examples:**

- `@agentic/search`

### Deployment Identifier

- `${projectIdentifier}` will implicitly use `${projectIdentifier}@latest`
- `${projectIdentifier}@latest` (the most recently published deployment)
- `${projectIdentifier}@dev` (the most recently pushed deployment)
- `${projectIdentifier}@deploymentHash` (a specific deployment)
- `${projectIdentifier}@version` (a specific published deployment specified via `semver`)

**Examples:**

- `@agentic/search`
- `@agentic/search@latest`
- `@agentic/search@1.0.0`

### Tool Identifier

- `${deploymentIdentifier}/tool_name`

**Examples:**

- `@agentic/search/search`
- `@agentic/search@latest/search`
- `@agentic/search@1.0.0/search`

### Tool Names

- Must start with a letter or underscore
- Can include only letters, numbers, and underscores
- Use either camelCase or snake_case consistently across all tools

[OpenAI vs Anthropic vs Google vs MCP tool name restrictions](https://chatgpt.com/share/68419382-73a0-8007-afce-0ded7d9f05e7)

## License

[GNU AGPL 3.0](https://choosealicense.com/licenses/agpl-3.0/)
