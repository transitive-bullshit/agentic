<h1 align="center">Agentic</h1>

<p align="center">
  TODO
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@agentic/core"><img alt="@agentic/core npm package" src="https://img.shields.io/npm/v/@agentic/core.svg" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/test.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/test.yml/badge.svg" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

- [Intro](#intro)
- [Development](#development)
  - [Environment](#environment)
  - [Local Testing](#local-testing)
  - [Scratch](#scratch)
- [License](#license)

## Intro

TODO

## Development

- [node](https://nodejs.org/en) >= 18
- [pnpm](https://pnpm.io) >= 8

```bash
pnpm install
```

### Environment

```bash
cp .env.example .env
```

**Required**

- `OPENAI_API_KEY` - OpenAI API key.
- `REDIS_URL_TEST` - Redis server URL used for caching third-party API calls during testing.

**Optional**

- `ANTHROPIC_API_KEY` - [Anthropic](https://www.anthropic.com) API key ([docs](https://console.anthropic.com/docs))
- `SERPAPI_API_KEY` - [SerpApi](https://serpapi.com) API key ([docs](https://serpapi.com/search-api))
- `METAPHOR_API_KEY` - [Metaphor](https://metaphor.systems) API key ([docs](https://metaphorapi.readme.io/))

### Local Testing

Ensure you have `REDIS_URL_TEST` set to a valid redis connection URL.

```bash
pnpm test
```

### Scratch

- `@agentic/core`
  - Task, Agentic, logging, caching, types, constants
- `@agentic/human-feedback`
- `@agentic/human-feedback-cli`
- `@agentic/human-feedback-sms`
- `@agentic/human-feedback-slack`
- `@agentic/experimenation`
- `@agentic/tools`
- `@agentic/tools-serpapi`
- `@agentic/tools-metaphor`
- `@agentic/tools-browser`
- `@agentic/tools-multion`
- `@agentic/llms`
- `@agentic/llms-openai`
- `@agentic/llms-anthropic`
- `@agentic/llms-huggingface`
- `@agentic/agents`
- `@agentic/cli`

## License

MIT © [Travis Fischer](https://transitivebullsh.it)
