> [!IMPORTANT]
> (_June 28, 2025_) As part of an upcoming major Agentic 2.0 release, our site and docs will be undergoing breaking changes over the next few days. Please be patient if the site / docs don't load correctly until the transition is complete. Thank you && really excited to share more about Agentic's new direction soon!! 🙏

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
  - [Using Multiple Tools](#using-multiple-tools)
- [Features](#features)
- [Docs](#docs)
- [AI SDKs](#ai-sdks)
  - [Vercel AI SDK](#vercel-ai-sdk)
  - [Mastra](#mastra)
  - [LangChain](#langchain)
  - [LlamaIndex](#llamaindex)
  - [Firebase Genkit](#firebase-genkit)
  - [Dexa Dexter](#dexa-dexter)
  - [OpenAI](#openai)
  - [GenAIScript](#genaiscript)
  - [xsAI SDK](#xsai-sdk)
- [Tools](#tools)
- [Contributors](#contributors)
- [License](#license)

## Intro

Agentic is a **standard library of AI functions / tools** which are **optimized for both normal TS-usage as well as LLM-based usage**. Agentic works with all of the major TS AI SDKs (Vercel AI SDK, Mastra, LangChain, LlamaIndex, OpenAI SDK, MCP, etc).

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

Or you can use these clients as **LLM-based tools**. Here's an example using [Vercel's AI SDK](https://github.com/vercel/ai):

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

### Using Multiple Tools

All adapters (like `createAISDKTools`) accept a very flexible var args of `AIFunctionLike` parameters, so you can pass as many tools as you'd like.

They also expose a `.functions` property which is an `AIFunctionSet`. This combination makes it really easy to mix & match different tools together.

```ts
import { SerperClient, WikipediaClient, FirecrawlClient } from '@agentic/stdlib'
import { createAIFunction } from '@agentic/core'
import { z } from 'zod'

const googleSearch = new SerperClient()
const wikipedia = new WikipediaClient()
const firecrawl = new FirecrawlClient()

const result = await generateText({
  model: openai('gpt-4o-mini'),
  // This example uses tools from 4 different sources. You can pass as many
  // AIFunctionLike objects as you want.
  tools: createAISDKTools(
    googleSearch,
    wikipedia,
    // Pick a single function from the firecrawl client's set of AI functions
    firecrawl.functions.pick('firecrawl_search'),
    // Create a custom AI function (based off of Anthropic's think tool: https://www.anthropic.com/engineering/claude-think-tool)
    createAIFunction({
      name: 'think',
      description: `Use this tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.`,
      inputSchema: z.object({
        thought: z.string().describe('A thought to think about.')
      }),
      execute: ({ thought }) => thought
    })
  ),
  prompt:
    'What year did Jurassic Park the movie come out, and what else happened that year?'
})
```

An `AIFunctionLike` can be any agentic client instance, a single `AIFunction` selected from the client's `.functions` property (which holds an `AIFunctionSet` of available AI functions), or an AI function created manually via `createAIFunction`.

`AIFunctionLike` and `AIFunctionSet` are implementation details that you likely won't have to touch directly, but they're important because of their flexibility.

## Features

- ✅ All tools are thoroughly tested in production
- ✅ Tools work across all leading TS AI SDKs
- ✅ Tools are hand-coded and extremely minimal
- ✅ Tools have both a good manual DX and LLM DX via the `@aiFunction` decorator
- ✅ Tools use native `fetch`
- ✅ Tools use [ky](https://github.com/sindresorhus/ky) to wrap `fetch`, so HTTP options, throttling, retries, etc are easy to customize
- ✅ Supports tools from any MCP server ([createMcpTools(...)](https://agentic.so/tools/mcp))
- ✅ Generate new Agentic tool clients from OpenAPI specs ([@agentic/openapi-to-ts](./packages/openapi-to-ts))
- ✅ 100% open source && not trying to sell you anything 💯

## Docs

Full docs are available at [agentic.so](https://agentic.so).

## AI SDKs

### Vercel AI SDK

[Agentic adapter docs for the Vercel AI SDK](https://agentic.so/sdks/ai-sdk)

### Mastra

[Agentic adapter docs for the Mastra AI Agent framework](https://agentic.so/sdks/mastra)

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

### xsAI SDK

[Agentic adapter docs for the xsAI SDK](https://agentic.so/sdks/xsai)

## Tools

| Service / Tool                                                                  | Package                         | Docs                                                  | Description                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Airtable](https://airtable.com/developers/web/api/introduction)                | `@agentic/airtable`             | [docs](https://agentic.so/tools/airtable)             | No-code spreadsheets, CRM, and database.                                                                                                                                                                                                                       |
| [Apollo](https://docs.apollo.io)                                                | `@agentic/apollo`               | [docs](https://agentic.so/tools/apollo)               | B2B person and company enrichment API.                                                                                                                                                                                                                         |
| [ArXiv](https://arxiv.org)                                                      | `@agentic/arxiv`                | [docs](https://agentic.so/tools/arxiv)                | Search for research articles.                                                                                                                                                                                                                                  |
| [Bing](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)           | `@agentic/bing`                 | [docs](https://agentic.so/tools/bing)                 | Bing web search.                                                                                                                                                                                                                                               |
| [Brave Search](https://brave.com/search/api)                                    | `@agentic/brave-search`         | [docs](https://agentic.so/tools/brave-search)         | Brave web search and local places search.                                                                                                                                                                                                                      |
| [Calculator](https://github.com/josdejong/mathjs)                               | `@agentic/calculator`           | [docs](https://agentic.so/tools/calculator)           | Basic calculator for simple mathematical expressions.                                                                                                                                                                                                          |
| [Clearbit](https://dashboard.clearbit.com/docs)                                 | `@agentic/clearbit`             | [docs](https://agentic.so/tools/clearbit)             | Resolving and enriching people and company data.                                                                                                                                                                                                               |
| [Dexa](https://dexa.ai)                                                         | `@agentic/dexa`                 | [docs](https://agentic.so/tools/dexa)                 | Answers questions from the world's best podcasters.                                                                                                                                                                                                            |
| [Diffbot](https://docs.diffbot.com)                                             | `@agentic/diffbot`              | [docs](https://agentic.so/tools/diffbot)              | Web page classification and scraping; person and company data enrichment.                                                                                                                                                                                      |
| [DuckDuckGo](https://duckduckgo.com)                                            | `@agentic/duck-duck-go`         | [docs](https://agentic.so/tools/duck-duck-go)         | Privacy-focused web search API.                                                                                                                                                                                                                                |
| [E2B](https://e2b.dev)                                                          | `@agentic/e2b`                  | [docs](https://agentic.so/tools/e2b)                  | Hosted Python code interpreter sandbox which is really useful for data analysis, flexible code execution, and advanced reasoning on-the-fly.                                                                                                                   |
| [Exa](https://docs.exa.ai)                                                      | `@agentic/exa`                  | [docs](https://agentic.so/tools/exa)                  | Web search tailored for LLMs.                                                                                                                                                                                                                                  |
| [Firecrawl](https://www.firecrawl.dev)                                          | `@agentic/firecrawl`            | [docs](https://agentic.so/tools/firecrawl)            | Website scraping and structured data extraction.                                                                                                                                                                                                               |
| [Google Custom Search](https://developers.google.com/custom-search/v1/overview) | `@agentic/google-custom-search` | [docs](https://agentic.so/tools/google-custom-search) | Official Google Custom Search API.                                                                                                                                                                                                                             |
| [Google Drive](https://developers.google.com/workspace/drive/api)               | `@agentic/google-drive`         | [docs](https://agentic.so/tools/google-drive)         | Simplified Google Drive API.                                                                                                                                                                                                                                   |
| [Google Docs](https://developers.google.com/workspace/docs/api)                 | `@agentic/google-docs`          | [docs](https://agentic.so/tools/google-docs)          | Simplified Google Docs API.                                                                                                                                                                                                                                    |
| [Gravatar](https://docs.gravatar.com/api/profiles/rest-api/)                    | `@agentic/gravatar`             | [docs](https://agentic.so/tools/gravatar)             | Gravatar profile API.                                                                                                                                                                                                                                          |
| [HackerNews](https://github.com/HackerNews/API)                                 | `@agentic/hacker-news`          | [docs](https://agentic.so/tools/hacker-news)          | Official HackerNews API.                                                                                                                                                                                                                                       |
| [Hunter](https://hunter.io)                                                     | `@agentic/hunter`               | [docs](https://agentic.so/tools/hunter)               | Email finder, verifier, and enrichment.                                                                                                                                                                                                                        |
| [Jina](https://jina.ai/reader)                                                  | `@agentic/jina`                 | [docs](https://agentic.so/tools/jina)                 | URL scraper and web search.                                                                                                                                                                                                                                    |
| [LeadMagic](https://leadmagic.io)                                               | `@agentic/leadmagic`            | [docs](https://agentic.so/tools/leadmagic)            | B2B person, company, and email enrichment API.                                                                                                                                                                                                                 |
| [Midjourney](https://www.imagineapi.dev)                                        | `@agentic/midjourney`           | [docs](https://agentic.so/tools/midjourney)           | Unofficial Midjourney client for generative images.                                                                                                                                                                                                            |
| [McpTools](https://modelcontextprotocol.io)                                     | `@agentic/mcp`                  | [docs](https://agentic.so/tools/mcp)                  | Model Context Protocol (MCP) client, supporting any MCP server. Use [createMcpTools](https://agentic.so/tools/mcp) to spawn or connect to an MCP server.                                                                                                       |
| [Notion](https://developers.notion.com/docs)                                    | `@agentic/notion`               | [docs](https://agentic.so/tools/notion)               | Official Notion API for accessing pages, databases, and content.                                                                                                                                                                                               |
| [Novu](https://novu.co)                                                         | `@agentic/novu`                 | [docs](https://agentic.so/tools/novu)                 | Sending notifications (email, SMS, in-app, push, etc).                                                                                                                                                                                                         |
| [Open Meteo](https://open-meteo.com)                                            | `@agentic/open-meteo`           | [docs](https://agentic.so/tools/open-meteo)           | Free weather API (no API key required).                                                                                                                                                                                                                        |
| [People Data Labs](https://www.peopledatalabs.com)                              | `@agentic/people-data-labs`     | [docs](https://agentic.so/tools/people-data-labs)     | People & company data (WIP).                                                                                                                                                                                                                                   |
| [Perigon](https://www.goperigon.com/products/news-api)                          | `@agentic/perigon`              | [docs](https://agentic.so/tools/perigon)              | Real-time news API and web content data from 140,000+ sources. Structured and enriched by AI, primed for LLMs.                                                                                                                                                 |
| [Polygon](https://polygon.io)                                                   | `@agentic/polygon`              | [docs](https://agentic.so/tools/polygon)              | Stock market and company financial data.                                                                                                                                                                                                                       |
| [PredictLeads](https://predictleads.com)                                        | `@agentic/predict-leads`        | [docs](https://agentic.so/tools/predict-leads)        | In-depth company data including signals like fundraising events, hiring news, product launches, technologies used, etc.                                                                                                                                        |
| [Proxycurl](https://nubela.co/proxycurl)                                        | `@agentic/proxycurl`            | [docs](https://agentic.so/tools/proxycurl)            | People and company data from LinkedIn & Crunchbase.                                                                                                                                                                                                            |
| [Reddit](https://old.reddit.com/dev/api)                                        | `@agentic/reddit`               | [docs](https://agentic.so/tools/reddit)               | Basic readonly Reddit API for getting top/hot/new/rising posts from subreddits.                                                                                                                                                                                |
| [RocketReach](https://rocketreach.co/api/v2/docs)                               | `@agentic/rocketreach`          | [docs](https://agentic.so/tools/rocketreach)          | B2B person and company enrichment API.                                                                                                                                                                                                                         |
| [Searxng](https://docs.searxng.org)                                             | `@agentic/searxng`              | [docs](https://agentic.so/tools/searxng)              | OSS meta search engine capable of searching across many providers like Reddit, Google, Brave, Arxiv, Genius, IMDB, Rotten Tomatoes, Wikidata, Wolfram Alpha, YouTube, GitHub, [etc](https://docs.searxng.org/user/configured_engines.html#configured-engines). |
| [SerpAPI](https://serpapi.com/search-api)                                       | `@agentic/serpapi`              | [docs](https://agentic.so/tools/serpapi)              | Lightweight wrapper around SerpAPI for Google search.                                                                                                                                                                                                          |
| [Serper](https://serper.dev)                                                    | `@agentic/serper`               | [docs](https://agentic.so/tools/serper)               | Lightweight wrapper around Serper for Google search.                                                                                                                                                                                                           |
| [Slack](https://api.slack.com/docs)                                             | `@agentic/slack`                | [docs](https://agentic.so/tools/slack)                | Send and receive Slack messages.                                                                                                                                                                                                                               |
| [SocialData](https://socialdata.tools)                                          | `@agentic/social-data`          | [docs](https://agentic.so/tools/social-data)          | Unofficial Twitter / X client (readonly) which is much cheaper than the official Twitter API.                                                                                                                                                                  |
| [Tavily](https://tavily.com)                                                    | `@agentic/tavily`               | [docs](https://agentic.so/tools/tavily)               | Web search API tailored for LLMs.                                                                                                                                                                                                                              |
| [Twilio](https://www.twilio.com/docs/conversations/api)                         | `@agentic/twilio`               | [docs](https://agentic.so/tools/twilio)               | Twilio conversation API to send and receive SMS messages.                                                                                                                                                                                                      |
| [Twitter](https://developer.x.com/en/docs/twitter-api)                          | `@agentic/twitter`              | [docs](https://agentic.so/tools/twitter)              | Basic Twitter API methods for fetching users, tweets, and searching recent tweets. Includes support for plan-aware rate-limiting. Uses [Nango](https://www.nango.dev) for OAuth support.                                                                       |
| [Typeform](https://www.typeform.com/developers/get-started/)                    | `@agentic/typeform`             | [docs](https://agentic.so/tools/typeform)             | Readonly Typeform client for fetching form insights and responses.                                                                                                                                                                                             |
| [Weather](https://www.weatherapi.com)                                           | `@agentic/weather`              | [docs](https://agentic.so/tools/weather)              | Basic access to current weather data based on location.                                                                                                                                                                                                        |
| [Wikidata](https://www.wikidata.org/wiki/Wikidata:Data_access)                  | `@agentic/wikidata`             | [docs](https://agentic.so/tools/wikidata)             | Basic Wikidata client.                                                                                                                                                                                                                                         |
| [Wikipedia](https://www.mediawiki.org/wiki/API)                                 | `@agentic/wikipedia`            | [docs](https://agentic.so/tools/wikipedia)            | Wikipedia page search and summaries.                                                                                                                                                                                                                           |
| [Wolfram Alpha](https://products.wolframalpha.com/llm-api/documentation)        | `@agentic/wolfram-alpha`        | [docs](https://agentic.so/tools/wolfram-alpha)        | Wolfram Alpha LLM API client for answering computational, mathematical, and scientific questions.                                                                                                                                                              |
| [YouTube](https://developers.google.com/youtube/v3)                             | `@agentic/youtube`              | [docs](https://agentic.so/tools/youtube)              | YouTube data API v3 for searching YT videos and channels.                                                                                                                                                                                                      |
| [ZoomInfo](https://api-docs.zoominfo.com)                                       | `@agentic/zoominfo`             | [docs](https://agentic.so/tools/zoominfo)             | Powerful B2B person and company data enrichment.                                                                                                                                                                                                               |

> [!NOTE]
> Missing a tool or want to add your own tool to this list? If you have an OpenAPI v3 spec for your tool's API, we make it extremely easy to add support using our [@agentic/openapi-to-ts](./packages/openapi-to-ts) CLI. Otherwise, feel free to [open an issue to discuss](https://github.com/transitive-bullshit/agentic/issues/new?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) or submit a PR.

For more details on tool usage, see the [docs](https://agentic.so).

## Contributors

- [Travis Fischer](https://x.com/transitive_bs)
- [David Zhang](https://x.com/dzhng)
- [Philipp Burckhardt](https://x.com/burckhap)
- And all of these [amazing OSS contributors](https://github.com/transitive-bullshit/agentic/graphs/contributors):

<p align="center">
  <a href="https://github.com/transitive-bullshit/agentic/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=transitive-bullshit/agentic&max=150" width="600" />
  </a>
</p>

## License

MIT © [Travis Fischer](https://x.com/transitive_bs)

To stay up to date or learn more, follow [@transitive_bs](https://x.com/transitive_bs) on Twitter.
