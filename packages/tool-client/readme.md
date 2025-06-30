<p align="center">
  <a href="https://agentic.so/publishing">
    <img alt="Agentic" src="/apps/web/public/agentic-publishing-social-image-dark-github.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/platform-tool-client"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/platform-tool-client.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# @agentic/platform-tool-client <!-- omit from toc -->

> Main client for working with LLM tools hosted on the Agentic platform.

The purpose of this package is to connect TypeScript LLM SDKs to Agentic's hosted tools via the `AgenticToolClient.fromIdentifier(...)` method.

- [Website](https://agentic.so/publishing)
- [Docs](https://docs.agentic.so)

## Install

```bash
npm i @agentic/platform-tool-client
```

## Usage

This example uses the [Vercel AI SDK](https://ai-sdk.dev) and the [`@agentic/search`](https://agentic.so/marketplace/projects/@agentic/search) tool.

```ts
import 'dotenv/config'

import { createAISDKTools } from '@agentic/ai-sdk'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

async function main() {
  const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')
  const openai = createOpenAI({ compatibility: 'strict' })

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(searchTool),
    toolChoice: 'required',
    temperature: 0,
    system: 'You are a helpful assistant. Be as concise as possible.',
    prompt: 'What is the weather in San Francisco?'
  })

  console.log(JSON.stringify(result.toolResults[0], null, 2))
}

await main()
```

If you have a subscription to the Agentic project, you can specify your API key either by using the `AGENTIC_API_KEY` environment variable, or by passing it explicitly:

```ts
const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search', {
  apiKey: process.env.AGENTIC_API_KEY
})
```

Now all tool calls will be associated with your subscription for usage-tracking and billing purposes.

## Docs

See the [Agentic Quick Start](https://docs.agentic.so/marketplace) for more details on how to use Agentic tools with other TS LLM SDKs, MCP clients, and simple HTTP usage.

## License

[GNU AGPL 3.0](https://choosealicense.com/licenses/agpl-3.0/)
