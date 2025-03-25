<p align="center">
  <a href="https://agentic.so">
    <img alt="Agentic" src="https://raw.githubusercontent.com/transitive-bullshit/agentic/main/docs/media/agentic-header.jpg" width="308">
  </a>
</p>

<p align="center">
  <em>Generate an Agentic TypeScript client from an OpenAPI spec.</em>
</p>

<p align="center">
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/stdlib"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/stdlib.svg" /></a>
  <a href="https://github.com/transitive-bullshit/agentic/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

# Agentic

**See the [github repo](https://github.com/transitive-bullshit/agentic) or [docs](https://agentic.so) for more info.**

## Intro

`@agentic/openapi-to-ts` is a tool for converting OpenAPI specs into minimal, self-contained Agentic TypeScript clients. API operations are converted to AIFunction-compatible methods and all types are converted to Zod schemas.

The resulting tools are compatible with all leading TS AI SDKs.

## Example Usage

```sh
# local development
tsx bin/openapi-to-ts.ts fixtures/openapi/3.0/notion.json -o fixtures/generated

# published version
npx @agentic/openapi-to-ts fixtures/openapi/3.0/notion.json -o fixtures/generated

# npm install -g version
npm install -g @agentic/openapi-to-ts
openapi-to-ts fixtures/openapi/3.0/notion.json -o fixtures/generated
```

Most OpenAPI specs should be supported, but I've made no attempt to maximize robustness. This tool is meant to generate Agentic TS clients which are 99% of the way there, but some tweaking may be necessary post-generation.

Some things you may want to tweak:

- simplifying the zod parameters accepted by `@aiFunction` input schemas since LLMs tend to do better with a few, key parameters
- removing unused API endpoints & associated types that you don't want to expose to LLMs

## TODO

- convert openapi parsing & utils to https://github.com/readmeio/oas
- support filters
  - optional array of path globs
  - optional array of tag globs
  - consider using https://github.com/micromatch/micromatch
- Convert HTML in descriptions to markdown
- Properly format multiline function comments
- Debug stripe schema issue
- Fix `json-schema-to-zod` `withJsdocs` issue (github example) where jsdocs aren't escaped for JS block comments
- Fix github example issue with `nullable()` zod schema parameter
- Fix github `json-schema-to-zod` example issue with string enum given default value `true` as a non-string boolean
- Fix github `gists/get-revision` missing path parameter because of ref

## License

MIT © [Travis Fischer](https://x.com/transitive_bs)
