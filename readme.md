<p align="center">
  <a href="https://trywalter.ai"><img alt="Agentic" src="/media/agentic-header.jpg" width="308"></a>
</p>

<p align="center">
  <em>AI agent stdlib that works with any AI SDK and LLM</em>
</p>

<p align="center">
  <a href="https://github.com/transitive-bullshit/walter/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/walter/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/stdlib"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/stdlib.svg" /></a>
  <a href="https://github.com/transitive-bullshit/walter/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic <!-- omit from toc -->

> [!WARNING]  
> TODO: this project is not published yet and is an active WIP.

The goal of this project is to create a **set of standard AI functions / tools** which are **optimized for both normal TS-usage as well as LLM-based usage** across any popular AI SDK via simple adaptors.

For example, all of the stdlib tools like `WeatherClient` can be used both as normal, fully-typed TS SDKs:

```ts
import { WeatherClient } from '@agentic/stdlib'

const weather = new WeatherClient() // (requires `WEATHER_API_KEY` env var)

const result = await clearbit.getCurrentWeather({
  q: 'San Francisco'
})

console.log(result)
```

Or you can use them as a set of LLM-based functions / tools using adaptors specific to each LLM SDK. This example uses [Vercel's AI SDK](https://github.com/vercel/ai):

```ts
// sdk-specific imports
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createAISDKTools } from '@agentic/stdlib/ai-sdk'

// sdk-agnostic imports
import { WeatherClient } from '@agentic/stdlib'

const weather = new WeatherClient()

const result = await generateText({
  model: openai('gpt-4o'),
  tools: createAISDKTools(weather),
  toolChoice: 'required',
  prompt: 'What is the weather in San Francisco?'
})

console.log(result.toolResults[0])
```

Let's take a slightly more complicated example which uses multiple clients and selects a subset of their functions using the `pick` method:

```ts
// sdk-specific imports
import { ChatModel, createAIRunner } from '@dexaai/dexter'
import { createDexterFunctions } from '@agentic/stdlib/dexter'

// sdk-agnostic imports
import { PerigonClient, SerperClient } from '@agentic/stdlib'

async function main() {
  const perigon = new PerigonClient()
  const serper = new SerperClient()

  const runner = createAIRunner({
    chatModel: new ChatModel({
      params: { model: 'gpt-4o', temperature: 0 }
    }),
    functions: createDexterFunctions(
      perigon.functions.pick('search_news_stories'),
      serper
    ),
    systemMessage:
      'You are a helpful assistant. Be as concise as possible. Respond in markdown. Always cite your sources.'
  })

  const result = await runner(
    'Summarize the latest news stories about the upcoming US election.'
  )
  console.log(result)
}
```

Here we've exposed 2 functions to the LLM, `search_news_stories` which corresponds to the `PerigonClient.searchStories` method and `serper_google_search` via the `SerperClient.search` method.

All of the SDK adaptors like `createDexterFunctions` are very flexible in what they accept. `AIFunctionLike` objects include:

- `AIFunctionSet` - Sets of AI functions (like `perigon.functions.pick('search_news_stories')` or `perigon.functions` or `serper.functions`)
- `AIFunctionsProvider` - Client classes which expose an `AIFunctionSet` via the `.functions` property (like `perigon` or `serper`)
- `AIFunction` - Individual functions (like `perigon.functions.get('search_news_stories')` or `serper.functions.get('serper_google_search')`)

You can pass as many or as few of these `AIFunctionLike` objects as you'd like and you can manipulate them as `AIFunctionSet` objects via `.pick`, `.omit`, `.get`, `.map`, etc.

The SDK-specific imports are all isolated to keep the main `@agentic/stdlib` as lightweight as possible.

## Client Goals

- clients should be as minimal as possible
- clients must use `ky` as a lightweight native fetch wrapper
- clients must have a strongly-typed TS DX
- clients should expose select methods via the `@aiFunction(...)` decorator
  - `@aiFunction` methods must use `zod` for input schema validation
- it should be easy to create external clients which follow the `AIFunctionsProvider` superclass / `@aiFunction` decorator pattern
- common utility functions for LLM-based function calling should be exported for convenience
- clients and AIFunctions should be composable via `AIFunctionSet`
- clients must work with all major TS AI SDKs
  - SDK adaptors should be as lightweight as possible and be optional peer dependencies of `@agentic/stdlib`
  - SDK adatptor entrypoints should all be isolated to their own top-level imports
    - `@agentic/stdlib/ai-sdk`
    - `@agentic/stdlib/langchain`
    - `@agentic/stdlib/llamaindex`
    - `@agentic/stdlib/dexter`
    - `@agentic/stdlib/genkit`

## Services

- bing
- clearbit
- dexa
- diffbot
- exa
- firecrawl
- midjourney (unofficial API)
- novu
- people data labs (WIP)
- perigon
- predict leads
- proxycurl
- scraper
- searxng
- serpapi
- serper
- twitter
- wolfram alpha
- weatherapi
- wikipedia

## Non-service Tools

- calculator
- e2b (code interpreter)
- search and scrape

## AI SDKs

- OpenAI SDK
  - no need for an adaptor; use `AIFunctionSet.specs` or `AIFunctionSet.toolSpecs`
- Vercel AI SDK
  - `import { createAISDKTools } from '@agentic/stdlib/ai-sdk'`
- LangChain
  - `import { createLangChainTools } from '@agentic/stdlib/langchain'`
- LlamaIndex
  - `import { createLlamaIndexTools } from '@agentic/stdlib/llamaindex'`
- Firebase Genkit
  - `import { createGenkitTools } from '@agentic/stdlib/genkit'`
- Dexa Dexter
  - `import { createDexterFunctions } from '@agentic/stdlib/dexter'`

## TODO

- rename this repo to agentic
- services
  - replicate
  - huggingface
  - [skyvern](https://github.com/Skyvern-AI/skyvern)
  - unstructured
  - pull from [langchain](https://github.com/langchain-ai/langchainjs/tree/main/langchain)
    - provide a converter for langchain `DynamicStructuredTool`
  - pull from [nango](https://docs.nango.dev/integrations/overview)
  - pull from [activepieces](https://github.com/activepieces/activepieces/tree/main/packages/pieces/community)
  - general openapi support ala [workgpt](https://github.com/team-openpm/workgpt)
- tools / chains / flows / runnables
  - market maps
- https://github.com/causaly/zod-validation-error
- investigate [autotool](https://github.com/run-llama/LlamaIndexTS/tree/main/packages/autotool)
- investigate [data connectors](https://github.com/mendableai/data-connectors)

## License

MIT © [Travis Fischer](https://twitter.com/transitive_bs)

To stay up to date or learn more, follow [@transitive_bs](https://twitter.com/transitive_bs) on Twitter.
