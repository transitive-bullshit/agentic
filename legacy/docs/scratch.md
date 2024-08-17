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
