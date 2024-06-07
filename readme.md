<p align="center">
  <img alt="Agentic" src="/media/agentic-header.jpg" width="308">
</p>

<p align="center">
  <em>AI agent stdlib that works with any LLM and TypeScript AI SDK</em>
</p>

<p align="center">
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/stdlib"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/stdlib.svg" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic <!-- omit from toc -->

> [!WARNING]
> TODO: this project is not published yet and is an active WIP.

The goal of this project is to create a **set of standard AI functions / tools** which are **optimized for both normal TS-usage as well as LLM-based apps** and that work with all of the major AI SDKs (LangChain, LlamaIndex, Vercel AI SDK, OpenAI SDK, etc).

For example, stdlib clients like `WeatherClient` can be used as normal TS classes:

```ts
import { WeatherClient } from '@agentic/stdlib'

const weather = new WeatherClient() // (requires `WEATHER_API_KEY` env var)

const result = await weather.getCurrentWeather({
  q: 'San Francisco'
})
console.log(result)
```

Or you can use them as LLM-based tools where the LLM decides when and how to invoke the underlying functions for you.

This works across all of the major AI SDKs via adaptors. Here's an example using [Vercel's AI SDK](https://github.com/vercel/ai):

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
  // this is the key line which uses the `@agentic/stdlib/ai-sdk` adaptor
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
import { createDexterFunctions } from '@agentic/stdlib/dexter'

// sdk-agnostic imports
import { PerigonClient, SerperClient } from '@agentic/stdlib'

async function main() {
  // Perigon is a news API and Serper is a Google search API
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
    systemMessage: `You are a helpful assistant. Be as concise as possible.`
  })

  const result = await runner(
    'Summarize the latest news stories about the upcoming US election.'
  )
  console.log(result)
}
```

Here we've exposed 2 functions to the LLM, `search_news_stories` (which comes from the `PerigonClient.searchStories` method) and `serper_google_search` (which implicitly comes from the `SerperClient.search` method).

All of the SDK adaptors like `createDexterFunctions` accept very flexible in what they accept. `AIFunctionLike` objects include:

- `AIFunctionSet` - Sets of AI functions (like `perigon.functions.pick('search_news_stories')` or `perigon.functions` or `serper.functions`)
- `AIFunctionsProvider` - Client classes which expose an `AIFunctionSet` via the `.functions` property (like `perigon` or `serper`)
- `AIFunction` - Individual functions (like `perigon.functions.get('search_news_stories')` or `serper.functions.get('serper_google_search')` or AI functions created directly via the `createAIFunction` utility function)

You can pass as many of these `AIFunctionLike` objects as you'd like and you can manipulate them as `AIFunctionSet` sets via `.pick`, `.omit`, `.get`, `.map`, etc.

All heavy third-party imports are isolated as _optional peer dependencies_ to keep the main `@agentic/stdlib` package as lightweight as possible.

## Services

| Service                                                                  | Client                 | Description                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Bing](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)    | `BingClient`           | Bing web search.                                                                                                                                                                                                                                               |
| [Calculator](https://github.com/silentmatt/expr-eval)                    | `calculator`           | Basic calculator for simple mathematical expressions.                                                                                                                                                                                                          |
| [Clearbit](https://dashboard.clearbit.com/docs)                          | `ClearbitClient`       | Resolving and enriching people and company datae.                                                                                                                                                                                                              |
| [Dexa](https://dexa.ai)                                                  | `DexaClient`           | Answers questions from the world's best podcasters.                                                                                                                                                                                                            |
| [Diffbot](https://docs.diffbot.com)                                      | `DiffbotClient`        | Web page classification and scraping; person and company data enrichment.                                                                                                                                                                                      |
| [E2B](https://e2b.dev)                                                   | `e2b`                  | Hosted Python code intrepreter sandbox which is really useful for data analysis, flexible code execution, and advanced reasoning on-the-fly.                                                                                                                   |
| [Exa](https://docs.exa.ai)                                               | `ExaClient`            | Web search tailored for LLMs.                                                                                                                                                                                                                                  |
| [Firecrawl](https://www.firecrawl.dev)                                   | `FirecrawlClient`      | Website scraping and sanitization.                                                                                                                                                                                                                             |
| [Midjourney](https://www.imagineapi.dev)                                 | `MidjourneyClient`     | Unofficial Midjourney client for generative images.                                                                                                                                                                                                            |
| [Novu](https://novu.co)                                                  | `NovuClient`           | Sending notifications (email, SMS, in-app, push, etc).                                                                                                                                                                                                         |
| [People Data Labs](https://www.peopledatalabs.com)                       | `PeopleDataLabsClient` | People & company data (WIP).                                                                                                                                                                                                                                   |
| [Perigon](https://www.goperigon.com/products/news-api)                   | `PerigonClient`        | Real-time news API and web content data from 140,000+ sources. Structured and enriched by AI, primed for LLMs.                                                                                                                                                 |
| [Polygon](https://polygon.io)                                            | `PolygonClient`        | Stock market and company financial data.                                                                                                                                                                                                                       |
| [PredictLeads](https://predictleads.com)                                 | `PredictLeadsClient`   | In-depth company data including signals like fundraising events, hiring news, product launches, technologies used, etc.                                                                                                                                        |
| [Proxycurl](https://nubela.co/proxycurl)                                 | `ProxycurlClient`      | People and company data from LinkedIn & Crunchbase.                                                                                                                                                                                                            |
| Scraper                                                                  | `ScraperClient`        | Scrapes URLs into clean html/markdown/text content (TODO: currently closed beta).                                                                                                                                                                              |
| [Searxng](https://docs.searxng.org)                                      | `SearxngClient`        | OSS meta search engine capable of searching across many providers like Reddit, Google, Brave, Arxiv, Genius, IMDB, Rotten Tomatoes, Wikidata, Wolfram Alpha, YouTube, GitHub, [etc](https://docs.searxng.org/user/configured_engines.html#configured-engines). |
| [SerpAPI](https://serpapi.com/search-api)                                | `SerpAPIClient`        | Lightweight wrapper around SerpAPI for Google search.                                                                                                                                                                                                          |
| [Serper](https://serper.dev)                                             | `SerperClient`         | Lightweight wrapper around Serper for Google search.                                                                                                                                                                                                           |
| [Slack](https://api.slack.com/docs)                                      | `SlackClient`          | Send and receive Slack messages.                                                                                                                                                                                                                               |
| [Tavily](https://tavily.com)                                             | `TavilyClient`         | Web search API tailored for LLMs. 🔥                                                                                                                                                                                                                           |
| [Twilio](https://www.twilio.com/docs/conversations/api)                  | `TwilioClient`         | Twilio conversation API to send and receive SMS messages.                                                                                                                                                                                                      |
| [Twitter](https://developer.x.com/en/docs/twitter-api)                   | `TwitterClient`        | Basic Twitter API methods for fetching users, tweets, and searching recent tweets. Includes support for plan-aware rate-limiting. Uses [Nango](https://www.nango.dev) for OAuth support.                                                                       |
| [WeatherAPI](https://www.weatherapi.com)                                 | `WeatherClient`        | Basic access to current weather data based on location.                                                                                                                                                                                                        |
| [Wikipedia](https://www.mediawiki.org/wiki/API)                          | `WikipediaClient`      | Wikipedia page search and summaries.                                                                                                                                                                                                                           |
| [Wolfram Alpha](https://products.wolframalpha.com/llm-api/documentation) | `WolframAlphaClient`   | Wolfram Alpha LLM API client for answering computational, mathematical, and scientific questions.                                                                                                                                                              |

Note that many of these clients expose multiple AI functions.

## Compound Tools

- `SearchAndCrawl`

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

## Client Goals

- clients should be as minimal as possible
- clients should use `ky` and `zod` where possible
- clients should have a strongly-typed TS DX
- clients should expose select methods via the `@aiFunction(...)` decorator
  - `inputSchema` zod schemas should be as minimal as possible with descriptions prompt engineered specifically for use with LLMs
- clients and AIFunctions should be composable via `AIFunctionSet`
- clients should work with all major TS AI SDKs
  - SDK adaptors should be as lightweight as possible and be optional peer dependencies of `@agentic/stdlib`

## TODO

- rename this repo to agentic
- sdks
  - modelfusion
- services
  - browserbase
  - [phantombuster](https://phantombuster.com)
  - perplexity
  - valtown
  - replicate
  - huggingface
  - [skyvern](https://github.com/Skyvern-AI/skyvern)
  - pull from [langchain](https://github.com/langchain-ai/langchainjs/tree/main/langchain)
    - provide a converter for langchain `DynamicStructuredTool`
  - pull from [nango](https://docs.nango.dev/integrations/overview)
  - pull from [activepieces](https://github.com/activepieces/activepieces/tree/main/packages/pieces/community)
  - general openapi support ala [workgpt](https://github.com/team-openpm/workgpt)
- compound tools / chains / flows / runnables
  - market maps
- incorporate [zod-validation-error](https://github.com/causaly/zod-validation-error)
- investigate [autotool](https://github.com/run-llama/LlamaIndexTS/tree/main/packages/autotool)
- investigate [data connectors](https://github.com/mendableai/data-connectors)

## Contributors

- [Travis Fischer](https://x.com/transitive_bs)
- [Kevin Raheja](https://x.com/crabfisher)
- [David Zhang](https://x.com/dzhng)
- [Philipp Burckhardt](https://x.com/burckhap)
- [Riley Tomasek](https://x.com/rileytomasek)

## License

MIT © [Travis Fischer](https://x.com/transitive_bs)

To stay up to date or learn more, follow [@transitive_bs](https://x.com/transitive_bs) on Twitter.
