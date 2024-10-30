<p align="center">
  <a href="https://agentic.so">
    <img alt="Agentic" src="/docs/media/agentic-header.jpg" width="308">
  </a>
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
- [Docs](#docs)
- [AI SDKs](#ai-sdks)
  - [Vercel AI SDK](#vercel-ai-sdk)
  - [LangChain](#langchain)
  - [LlamaIndex](#llamaindex)
  - [Firebase Genkit](#firebase-genkit)
  - [Dexa Dexter](#dexa-dexter)
  - [OpenAI](#openai)
- [Tools](#tools)
- [Contributors](#contributors)
- [License](#license)

## Intro

Agentic is a **standard library of AI functions / tools** which are **optimized for both normal TS-usage as well as LLM-based usage**. Agentic works with all of the major TS AI SDKs (LangChain, LlamaIndex, Vercel AI SDK, OpenAI SDK, etc).

Agentic clients like `WeatherClient` can be used as normal TS classes:

```ts
import { WeatherClient } from '@agentic/stdlib'

// Requires `process.env.WEATHER_API_KEY` (free from weatherapi.com)
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

## Docs

Full docs are available at [agentic.so](https://agentic.so).

## AI SDKs

### Vercel AI SDK

[Agentic adapter docs for the Vercel AI SDK](https://agentic.so/sdks/ai-sdk)

### LangChain

[Agentic adapter docs for LangChain](https://agentic.so/sdks/langchain)

### LlamaIndex

[Agentic adapter docs for LlamaIndex](https://agentic.so/sdks/llamaindex)

### Firebase Genkit

[Agentic adapter docs for Genkit](https://agentic.so/sdks/genkit)

### Dexa Dexter

[Agentic adapter docs for Dexter](https://agentic.so/sdks/dexter)

### OpenAI

[Agentic adapter docs for OpenAI](https://agentic.so/sdks/openai)

### GenAIScript

[Agentic support in GenAIScript](https://agentic.so/sdks/genaiscript)

## Tools

| Service / Tool                                                           | Package                     | Docs                                              | Description                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Bing](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)    | `@agentic/bing`             | [docs](https://agentic.so/tools/bing)             | Bing web search.                                                                                                                                                                                                                                               |
| [Calculator](https://github.com/josdejong/mathjs)                        | `@agentic/calculator`       | [docs](https://agentic.so/tools/calculator)       | Basic calculator for simple mathematical expressions.                                                                                                                                                                                                          |
| [Clearbit](https://dashboard.clearbit.com/docs)                          | `@agentic/clearbit`         | [docs](https://agentic.so/tools/clearbit)         | Resolving and enriching people and company data.                                                                                                                                                                                                               |
| [Dexa](https://dexa.ai)                                                  | `@agentic/dexa`             | [docs](https://agentic.so/tools/dexa)             | Answers questions from the world's best podcasters.                                                                                                                                                                                                            |
| [Diffbot](https://docs.diffbot.com)                                      | `@agentic/diffbot`          | [docs](https://agentic.so/tools/diffbot)          | Web page classification and scraping; person and company data enrichment.                                                                                                                                                                                      |
| [E2B](https://e2b.dev)                                                   | `@agentic/e2b`              | [docs](https://agentic.so/tools/e2b)              | Hosted Python code interpreter sandbox which is really useful for data analysis, flexible code execution, and advanced reasoning on-the-fly.                                                                                                                   |
| [Exa](https://docs.exa.ai)                                               | `@agentic/exa`              | [docs](https://agentic.so/tools/exa)              | Web search tailored for LLMs.                                                                                                                                                                                                                                  |
| [Firecrawl](https://www.firecrawl.dev)                                   | `@agentic/firecrawl`        | [docs](https://agentic.so/tools/firecrawl)        | Website scraping and structured data extraction.                                                                                                                                                                                                               |
| [HackerNews](https://github.com/HackerNews/API)                          | `@agentic/hacker-news`      | [docs](https://agentic.so/tools/hacker-news)      | Official HackerNews API.                                                                                                                                                                                                                                       |
| [Hunter](https://hunter.io)                                              | `@agentic/hunter`           | [docs](https://agentic.so/tools/hunter)           | Email finder, verifier, and enrichment.                                                                                                                                                                                                                        |
| [Jina](https://jina.ai/reader)                                           | `@agentic/jina`             | [docs](https://agentic.so/tools/jina)             | URL scraper and web search.                                                                                                                                                                                                                                    |
| [Midjourney](https://www.imagineapi.dev)                                 | `@agentic/midjourney`       | [docs](https://agentic.so/tools/midjourney)       | Unofficial Midjourney client for generative images.                                                                                                                                                                                                            |
| [Novu](https://novu.co)                                                  | `@agentic/novu`             | [docs](https://agentic.so/tools/novu)             | Sending notifications (email, SMS, in-app, push, etc).                                                                                                                                                                                                         |
| [People Data Labs](https://www.peopledatalabs.com)                       | `@agentic/people-data-labs` | [docs](https://agentic.so/tools/people-data-labs) | People & company data (WIP).                                                                                                                                                                                                                                   |
| [Perigon](https://www.goperigon.com/products/news-api)                   | `@agentic/perigon`          | [docs](https://agentic.so/tools/perigon)          | Real-time news API and web content data from 140,000+ sources. Structured and enriched by AI, primed for LLMs.                                                                                                                                                 |
| [Polygon](https://polygon.io)                                            | `@agentic/polygon`          | [docs](https://agentic.so/tools/polygon)          | Stock market and company financial data.                                                                                                                                                                                                                       |
| [PredictLeads](https://predictleads.com)                                 | `@agentic/predict-leads`    | [docs](https://agentic.so/tools/predict-leads)    | In-depth company data including signals like fundraising events, hiring news, product launches, technologies used, etc.                                                                                                                                        |
| [Proxycurl](https://nubela.co/proxycurl)                                 | `@agentic/proxycurl`        | [docs](https://agentic.so/tools/proxycurl)        | People and company data from LinkedIn & Crunchbase.                                                                                                                                                                                                            |
| [Searxng](https://docs.searxng.org)                                      | `@agentic/searxng`          | [docs](https://agentic.so/tools/searxng)          | OSS meta search engine capable of searching across many providers like Reddit, Google, Brave, Arxiv, Genius, IMDB, Rotten Tomatoes, Wikidata, Wolfram Alpha, YouTube, GitHub, [etc](https://docs.searxng.org/user/configured_engines.html#configured-engines). |
| [SerpAPI](https://serpapi.com/search-api)                                | `@agentic/serpapi`          | [docs](https://agentic.so/tools/serpapi)          | Lightweight wrapper around SerpAPI for Google search.                                                                                                                                                                                                          |
| [Serper](https://serper.dev)                                             | `@agentic/serper`           | [docs](https://agentic.so/tools/serper)           | Lightweight wrapper around Serper for Google search.                                                                                                                                                                                                           |
| [Slack](https://api.slack.com/docs)                                      | `@agentic/slack`            | [docs](https://agentic.so/tools/slack)            | Send and receive Slack messages.                                                                                                                                                                                                                               |
| [SocialData](https://socialdata.tools)                                   | `@agentic/social-data`      | [docs](https://agentic.so/tools/social-data)      | Unofficial Twitter / X client (readonly) which is much cheaper than the official Twitter API.                                                                                                                                                                  |
| [Tavily](https://tavily.com)                                             | `@agentic/tavily`           | [docs](https://agentic.so/tools/tavily)           | Web search API tailored for LLMs.                                                                                                                                                                                                                              |
| [Twilio](https://www.twilio.com/docs/conversations/api)                  | `@agentic/twilio`           | [docs](https://agentic.so/tools/twilio)           | Twilio conversation API to send and receive SMS messages.                                                                                                                                                                                                      |
| [Twitter](https://developer.x.com/en/docs/twitter-api)                   | `@agentic/twitter`          | [docs](https://agentic.so/tools/twitter)          | Basic Twitter API methods for fetching users, tweets, and searching recent tweets. Includes support for plan-aware rate-limiting. Uses [Nango](https://www.nango.dev) for OAuth support.                                                                       |
| [Weather](https://www.weatherapi.com)                                    | `@agentic/weather`          | [docs](https://agentic.so/tools/weather)          | Basic access to current weather data based on location.                                                                                                                                                                                                        |
| [Wikidata](https://www.wikidata.org/wiki/Wikidata:Data_access)           | `@agentic/wikidata`         | [docs](https://agentic.so/tools/wikidata)         | Basic Wikidata client.                                                                                                                                                                                                                                         |
| [Wikipedia](https://www.mediawiki.org/wiki/API)                          | `@agentic/wikipedia`        | [docs](https://agentic.so/tools/wikipedia)        | Wikipedia page search and summaries.                                                                                                                                                                                                                           |
| [Wolfram Alpha](https://products.wolframalpha.com/llm-api/documentation) | `@agentic/wolfram-alpha`    | [docs](https://agentic.so/tools/wolfram-alpha)    | Wolfram Alpha LLM API client for answering computational, mathematical, and scientific questions.                                                                                                                                                              |

For more details, see the [docs](https://agentic.so).

## Contributors

- [Travis Fischer](https://x.com/transitive_bs)
- [David Zhang](https://x.com/dzhng)
- [Philipp Burckhardt](https://x.com/burckhap)
- And all of the [amazing OSS contributors](https://github.com/transitive-bullshit/agentic/graphs/contributors)!

## License

MIT © [Travis Fischer](https://x.com/transitive_bs)

To stay up to date or learn more, follow [@transitive_bs](https://x.com/transitive_bs) on Twitter.
