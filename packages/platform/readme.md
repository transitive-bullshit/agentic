<p align="center">
  <a href="https://agentic.so/publishing">
    <img alt="Agentic" src="https://raw.githubusercontent.com/transitive-bullshit/agentic/main/apps/web/public/agentic-publishing-social-image-dark-github.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/platform"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/platform.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# @agentic/platform <!-- omit from toc -->

> Public SDK for developers building on top of the Agentic platform.

- [Website](https://agentic.so/publishing)
- [Docs](https://docs.agentic.so)

## Install

```bash
npm i @agentic/platform
```

## Usage

The main export of `@agentic/platform` is the `defineConfig(...)` function, which enables you to configure your Agentic project with full type safety and autocomplete.

```ts
import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: '<Your Project Name>',
  description: '<A brief description of your project>',
  origin: {
    type: 'mcp',
    url: '<Your Remote MCP Server URL>'
  }
})
```

## Docs

See the [Agentic Publishing Quick Start](https://docs.agentic.so/publishing/quickstart) for more details.

## License

[GNU AGPL 3.0](https://choosealicense.com/licenses/agpl-3.0/)
