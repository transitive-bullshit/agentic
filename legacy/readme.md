<p align="center">
  <img alt="Agentic" src="/media/agentic-header.jpg" width="308">
</p>

<p align="center">
  <em>AI agent stdlib that works with any LLM and TypeScript AI SDK.</em>
</p>

<p align="center">
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/stdlib"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/stdlib.svg" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic <!-- omit from toc -->

- [Intro](#intro)
- [Install](#install)
  - [Optimized Imports](#optimized-imports)
  - [AI SDKs](#ai-sdks)
    - [Vercel AI SDk](#vercel-ai-sdk)
    - [LangChain](#langchain)
    - [LlamaIndex](#llamaindex)
    - [Firebase Genkit](#firebase-genkit)
    - [Dexa Dexter](#dexa-dexter)
    - [OpenAI SDK](#openai-sdk)
- [Tools](#tools)
- [Client Design Philosophy](#client-design-philosophy)
- [TODO](#todo)
- [Contributors](#contributors)
- [License](#license)

## Intro

Agentic is a **standard library of AI functions / tools** which are **optimized for both normal TS-usage as well as LLM-based usage**. Agentic works with all of the major TS AI SDKs (LangChain, LlamaIndex, Vercel AI SDK, OpenAI SDK, etc).

Agentic clients like `WeatherClient` can be used as normal TS classes:

```ts
import { WeatherClient } from '@agentic/stdlib'

// Requires `process.env.WEATHER_API_KEY` (from weatherapi.com)
const weather = new WeatherClient()

const result = await weather.getCurrentWeather({
  q: 'San Francisco'
})
console.log(result)
```

Or you can use these clients as **LLM-based tools** where the LLM decides when and how to invoke the underlying functions for you.

This works across all of the major AI SDKs via adapters. Here's an example using [Vercel's AI SDK](https://github.com/vercel/ai):

```ts
// sdk-specific imports
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createAISDKTools } from '@agentic/ai-sdk'

// sdk-agnostic imports
import { WeatherClient } from '@agentic/stdlib'

const weather = new WeatherClient()

const result = await generateText({
  model: openai('gpt-4o-mini'),
  // this is the key line which uses the `@agentic/ai-sdk` adapter
  tools: createAISDKTools(weather),
  toolChoice: 'required',
  prompt: 'What is the weather in San Francisco?'
})

console.log(result.toolResults[0])
```

You can use our standard library of thoroughly tested AI functions with your favorite AI SDK – without having to write any glue code!

Here's a slightly more complex example which uses multiple clients and selects a subset of their functions using the `AIFunctionSet.pick` method:

```ts
// sdk-specific imports
import { ChatModel, createAIRunner } from '@dexaai/dexter'
import { createDexterFunctions } from '@agentic/dexter'

// sdk-agnostic imports
import { PerigonClient, SerperClient } from '@agentic/stdlib'

async function main() {
  // Perigon is a news API and Serper is a Google search API
  const perigon = new PerigonClient()
  const serper = new SerperClient()

  const runner = createAIRunner({
    chatModel: new ChatModel({
      params: { model: 'gpt-4o-mini', temperature: 0 }
    }),
    functions: createDexterFunctions(
      perigon.functions.pick('search_news_stories'),
      serper
    ),
    systemMessage: 'You are a helpful assistant. Be as concise as possible.'
  })

  const result = await runner(
    'Summarize the latest news stories about the upcoming US election.'
  )
  console.log(result)
}
```

Here we've exposed 2 functions to the LLM, `search_news_stories` (which comes from the `PerigonClient.searchStories` method) and `serper_google_search` (which implicitly comes from the `SerperClient.search` method).

All of the SDK adapters like `createDexterFunctions` accept very flexible `AIFunctionLike` objects, which include:

- `AIFunctionSet` - Sets of AI functions (like `perigon.functions.pick('search_news_stories')` or `perigon.functions` or `serper.functions`)
- `AIFunctionsProvider` - Client classes which expose an `AIFunctionSet` via the `.functions` property (like `perigon` or `serper`)
- `AIFunction` - Individual functions (like `perigon.functions.get('search_news_stories')` or `serper.functions.get('serper_google_search')` or AI functions created directly via the `createAIFunction` utility function)

You can pass as many of these `AIFunctionLike` objects as you'd like and you can manipulate them as `AIFunctionSet` sets via `.pick`, `.omit`, `.get`, `.map`, etc.

## Install

```sh
npm install @agentic/stdlib @agentic/core zod
```

- `@agentic/core` - exports core AI utils and `@aiFunction` decorator
- `@agentic/stdlib` - exports all of the built-in AI tools (convenience wrapper around the individual tool packages; see [Optimized Imports](#optimized-imports) if you'd rather import the individual packages directly)
- `zod` - used for schema validation

> [!NOTE]
> This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) and requires `Node.js >= 18` or an equivalent environment (bun, deno, CF workers, etc).

### Optimized Imports

`@agentic/stdlib` is just a convenience package which re-exports all of the built-in AI tool packages. If you want to optimize your imports, you can replace `@agentic/stdlib` with the specific AI tools you want. For example:

```sh
npm install @agentic/weather @agentic/core zod
```

```ts
import { WeatherClient } from '@agentic/weather'
```

> [!NOTE]
> There is no functional difference between using `@agentic/stdlib` versus using the individual packages directly. The only difference is if you want to optimize your install size (when running on serverless functions, for instance), in which case installing and using the individual packages directly will be more efficient. The default examples use `@agentic/stdlib` because it provides a simpler DX.

### AI SDKs

To use Agentic with one of the supported AI SDKs, you'll also need to install its (_really lightweight_) adapter package.

#### Vercel AI SDk

<details>
<summary>Install</summary>

```sh
npm install @agentic/ai-sdk ai
```

```ts
import { createAISDKTools } from '@agentic/ai-sdk'
```

See [examples/ai-sdk](./examples/ai-sdk) for a full example.

</details>

#### LangChain

<details>
<summary>Install</summary>

```sh
npm install @agentic/langchain @langchain/core langchain
```

```ts
import { createLangChainTools } from '@agentic/langchain'
```

See [examples/langchain](./examples/langchain) for a full example.

</details>

#### LlamaIndex

<details>
<summary>Install</summary>

```sh
npm install @agentic/llamaindex llamaindex
```

```ts
import { createLlamaIndexTools } from '@agentic/llamaindex'
```

See [examples/llamaindex](./examples/llamaindex) for a full example.

</details>

#### Firebase Genkit

<details>
<summary>Install</summary>

```sh
npm install @agentic/genkit @genkit-ai/ai @genkit-ai/core
```

```ts
import { createGenkitTools } from '@agentic/genkit'
```

See [examples/genkit](./examples/genkit) for a full example.

</details>

#### Dexa Dexter

<details>
<summary>Install</summary>

```sh
npm install @agentic/dexter @dexaai/dexter
```

```ts
import { createDexterFunctions } from '@agentic/dexter'
```

See [examples/dexter](./examples/dexter) for a full example.

</details>

#### OpenAI SDK

<details>
<summary>Install</summary>

```sh
npm install openai
```

There's no need for an adapter with the OpenAI SDK since all agentic tools are compatible with OpenAI by default. You can use `AIFunctionSet.specs` for function calling or `AIFunctionSet.toolSpecs` for parallel tool calling.

```ts
import { WeatherClient } from '@agentic/stdlib'
import OpenAI from 'openai'

const weather = new WeatherClient()
const openai = new OpenAI()

const messages: OpenAI.ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: 'You are a helpful assistant. Be as concise as possible.'
  },
  { role: 'user', content: 'What is the weather in San Francisco?' }
]

const res = await openai.chat.completions.create({
  messages,
  model: 'gpt-4o-mini',
  temperature: 0,
  tools: weather.functions.toolSpecs,
  tool_choice: 'required'
})
const message = res.choices[0]?.message!
console.log(JSON.stringify(message, null, 2))
assert(message.tool_calls?.[0]?.function?.name === 'get_current_weather')

const fn = weather.functions.get('get_current_weather')!

const toolParams = message.tool_calls[0].function.arguments
const toolResult = await fn(toolParams)
console.log(JSON.stringify(toolResult, null, 2))
```

See [examples/openai](./examples/openai) for a full example.

</details>

## Tools

| Service / Tool                                                           | Package                     | Named export           | Description                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | --------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Bing](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)    | `@agentic/bing`             | `BingClient`           | Bing web search.                                                                                                                                                                                                                                               |
| [Calculator](https://github.com/josdejong/mathjs)                        | `@agentic/calculator`       | `calculator`           | Basic calculator for simple mathematical expressions.                                                                                                                                                                                                          |
| [Clearbit](https://dashboard.clearbit.com/docs)                          | `@agentic/clearbit`         | `ClearbitClient`       | Resolving and enriching people and company datae.                                                                                                                                                                                                              |
| [Dexa](https://dexa.ai)                                                  | `@agentic/dexa`             | `DexaClient`           | Answers questions from the world's best podcasters.                                                                                                                                                                                                            |
| [Diffbot](https://docs.diffbot.com)                                      | `@agentic/diffbot`          | `DiffbotClient`        | Web page classification and scraping; person and company data enrichment.                                                                                                                                                                                      |
| [E2B](https://e2b.dev)                                                   | `@agentic/e2b`              | `e2b`                  | Hosted Python code intrepreter sandbox which is really useful for data analysis, flexible code execution, and advanced reasoning on-the-fly. (_peer dep_ `@e2b/code-interpreter`)                                                                              |
| [Exa](https://docs.exa.ai)                                               | `@agentic/exa`              | `ExaClient`            | Web search tailored for LLMs.                                                                                                                                                                                                                                  |
| [Firecrawl](https://www.firecrawl.dev)                                   | `@agentic/firecrawl`        | `FirecrawlClient`      | Website scraping and sanitization.                                                                                                                                                                                                                             |
| [HackerNews](https://github.com/HackerNews/API)                          | `@agentic/hacker-news`      | `HackerNewsClient`     | Official HackerNews API.                                                                                                                                                                                                                                       |
| [Hunter](https://hunter.io)                                              | `@agentic/hunter`           | `HunterClient`         | Email finder, verifier, and enrichment.                                                                                                                                                                                                                        |
| [Jina](https://jina.ai/reader)                                           | `@agentic/jina`             | `JinaClient`           | Clean URL reader and web search + URL top result reading with a generous free tier.                                                                                                                                                                            |
| [Midjourney](https://www.imagineapi.dev)                                 | `@agentic/midjourney`       | `MidjourneyClient`     | Unofficial Midjourney client for generative images.                                                                                                                                                                                                            |
| [Novu](https://novu.co)                                                  | `@agentic/novu`             | `NovuClient`           | Sending notifications (email, SMS, in-app, push, etc).                                                                                                                                                                                                         |
| [People Data Labs](https://www.peopledatalabs.com)                       | `@agentic/people-data-labs` | `PeopleDataLabsClient` | People & company data (WIP).                                                                                                                                                                                                                                   |
| [Perigon](https://www.goperigon.com/products/news-api)                   | `@agentic/perigon`          | `PerigonClient`        | Real-time news API and web content data from 140,000+ sources. Structured and enriched by AI, primed for LLMs.                                                                                                                                                 |
| [Polygon](https://polygon.io)                                            | `@agentic/polygon`          | `PolygonClient`        | Stock market and company financial data.                                                                                                                                                                                                                       |
| [PredictLeads](https://predictleads.com)                                 | `@agentic/predict-leads`    | `PredictLeadsClient`   | In-depth company data including signals like fundraising events, hiring news, product launches, technologies used, etc.                                                                                                                                        |
| [Proxycurl](https://nubela.co/proxycurl)                                 | `@agentic/proxycurl`        | `ProxycurlClient`      | People and company data from LinkedIn & Crunchbase.                                                                                                                                                                                                            |
| [Searxng](https://docs.searxng.org)                                      | `@agentic/searxng`          | `SearxngClient`        | OSS meta search engine capable of searching across many providers like Reddit, Google, Brave, Arxiv, Genius, IMDB, Rotten Tomatoes, Wikidata, Wolfram Alpha, YouTube, GitHub, [etc](https://docs.searxng.org/user/configured_engines.html#configured-engines). |
| [SerpAPI](https://serpapi.com/search-api)                                | `@agentic/serpapi`          | `SerpAPIClient`        | Lightweight wrapper around SerpAPI for Google search.                                                                                                                                                                                                          |
| [Serper](https://serper.dev)                                             | `@agentic/serper`           | `SerperClient`         | Lightweight wrapper around Serper for Google search.                                                                                                                                                                                                           |
| [Slack](https://api.slack.com/docs)                                      | `@agentic/slack`            | `SlackClient`          | Send and receive Slack messages.                                                                                                                                                                                                                               |
| [SocialData](https://socialdata.tools)                                   | `@agentic/social-data`      | `SocialDataClient`     | Unofficial Twitter / X client (readonly) which is much cheaper than the official Twitter API.                                                                                                                                                                  |
| [Tavily](https://tavily.com)                                             | `@agentic/tavily`           | `TavilyClient`         | Web search API tailored for LLMs.                                                                                                                                                                                                                              |
| [Twilio](https://www.twilio.com/docs/conversations/api)                  | `@agentic/twilio`           | `TwilioClient`         | Twilio conversation API to send and receive SMS messages.                                                                                                                                                                                                      |
| [Twitter](https://developer.x.com/en/docs/twitter-api)                   | `@agentic/twitter`          | `TwitterClient`        | Basic Twitter API methods for fetching users, tweets, and searching recent tweets. Includes support for plan-aware rate-limiting. Uses [Nango](https://www.nango.dev) for OAuth support.                                                                       |
| [Weather](https://www.weatherapi.com)                                    | `@agentic/weather`          | `WeatherClient`        | Basic access to current weather data based on location.                                                                                                                                                                                                        |
| [Wikidata](https://www.wikidata.org/wiki/Wikidata:Data_access)           | `@agentic/wikidata`         | `WikidataClient`       | Basic Wikidata client.                                                                                                                                                                                                                                         |
| [Wikipedia](https://www.mediawiki.org/wiki/API)                          | `@agentic/wikipedia`        | `WikipediaClient`      | Wikipedia page search and summaries.                                                                                                                                                                                                                           |
| [Wolfram Alpha](https://products.wolframalpha.com/llm-api/documentation) | `@agentic/wolfram-alpha`    | `WolframAlphaClient`   | Wolfram Alpha LLM API client for answering computational, mathematical, and scientific questions.                                                                                                                                                              |

Note that you can import any of these AI tools from `@agentic/stdlib` OR from their individual packages. Installing and importing from their individual packages is more efficient, but it's less convenient so it isn't the default.

## Client Design Philosophy

- clients should be as minimal as possible
- clients should use `ky` and `zod` where possible
- clients should have a strongly-typed TS DX
- clients should expose select methods via the `@aiFunction(...)` decorator
  - `inputSchema` zod schemas should be as minimal as possible with descriptions prompt engineered specifically for use with LLMs
- clients and AIFunctions should be composable via `AIFunctionSet`
- clients should work with all major TS AI SDKs

## TODO

- tools
  - browserbase
  - [brave search](https://brave.com/search/api/)
  - [phantombuster](https://phantombuster.com)
  - [apify](https://apify.com/store)
  - perplexity
  - valtown
  - replicate
  - huggingface
  - pull from [clay](https://www.clay.com/integrations)
  - pull from [langchain](https://github.com/langchain-ai/langchainjs/tree/main/langchain)
    - provide a converter for langchain `DynamicStructuredTool`
  - pull from [nango](https://docs.nango.dev/integrations/overview)
  - pull from [activepieces](https://github.com/activepieces/activepieces/tree/main/packages/pieces/community)
  - general openapi support ala [workgpt](https://github.com/team-openpm/workgpt)
- compound tools / chains / flows / runnables
  - market maps
- investigate [autotool](https://github.com/run-llama/LlamaIndexTS/tree/main/packages/autotool)
- investigate [alt search engines](https://seirdy.one/posts/2021/03/10/search-engines-with-own-indexes/)
- investigate [data connectors](https://github.com/mendableai/data-connectors)
- add unit tests for individual providers

## Contributors

- [Travis Fischer](https://x.com/transitive_bs)
- [David Zhang](https://x.com/dzhng)
- [Philipp Burckhardt](https://x.com/burckhap)
- And all of the [amazing OSS contributors](https://github.com/transitive-bullshit/agentic/graphs/contributors)!

## License

MIT © [Travis Fischer](https://x.com/transitive_bs)

To stay up to date or learn more, follow [@transitive_bs](https://x.com/transitive_bs) on Twitter.
