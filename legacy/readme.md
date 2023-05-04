<h1 align="center">Agentic</h1>

<p align="center">
  TODO
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/agentic"><img alt="agentic NPM package" src="https://img.shields.io/npm/v/agentic.svg" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/test.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/test.yml/badge.svg" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

## Intro

TODO

## TODO

https://github.com/colinhacks/zod#writing-generic-functions

## Use Cases

https://platform.openai.com/examples

- text completion
  - text generation
  - text classification
    - https://platform.openai.com/docs/guides/completion/classification
    - https://docs.cohere.com/docs/text-classification-with-classify
    - special cases
      - content moderation
        - https://platform.openai.com/docs/guides/moderation/overview
      - language detection
  - conversation
  - transformation
    - translation
    - conversion
    - summarization
  - completion
  - factual responses
- chat completion
- entity extraction
- reranking

// take in a query and a list of texts and produces an ordered array with each text assigned a relevance score.
// generate JSON conforming to a zod schema
// generate a string conforming to a zod schema
// generate TS code and ensure it is valid syntax + valid exports
// generate HTML and ensure it parses correctly
// primitives (boolean, number, z.coerce.date, string)
// classifier (enum)
// CSV

// retry strategies

// separate the prompt formatting from the inference call?

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

If you found this project interesting, please consider [sponsoring me](https://github.com/sponsors/transitive-bullshit) or <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
