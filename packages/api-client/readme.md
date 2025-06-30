<p align="center">
  <a href="https://agentic.so/publishing">
    <img alt="Agentic" src="/apps/web/public/agentic-publishing-social-image-dark-github.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/platform-api-client"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/platform-api-client.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# @agentic/platform-api-client <!-- omit from toc -->

> TypeScript API client for the Agentic platform.

- [Website](https://agentic.so/publishing)
- [Docs](https://docs.agentic.so)

> [!TIP]
> You likely don't need this package directly. See [@agentic/cli](https://github.com/transitive-bullshit/agentic/tree/main/packages/cli), [@agentic/platform](https://github.com/transitive-bullshit/agentic/tree/main/packages/platform), and [@agentic/platform-tool-client](https://github.com/transitive-bullshit/agentic/tree/main/packages/platform-tool-client) for more public-facing packages.

## Install

```bash
npm i @agentic/platform-api-client
```

## Usage

```ts
import { AgenticApiClient } from '@agentic/platform-api-client'

// Takes an optional `apiKey`
const agenticApiClient = new AgenticApiClient()

const searchProject = await agenticApiClient.getPublicProjectByIdentifier({
  projectIdentifier: '@agentic/search'
})
console.log(searchProject)
```

## License

[GNU AGPL 3.0](https://choosealicense.com/licenses/agpl-3.0/)
