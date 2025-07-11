<p align="center">
  <a href="https://agentic.so/publishing">
    <img alt="Agentic" src="https://raw.githubusercontent.com/transitive-bullshit/agentic/main/apps/web/public/agentic-publishing-social-image-dark-github.jpg" width="640">
  </a>
</p>

<p>
  <a href="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/agentic/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/@agentic/json-schema"><img alt="NPM" src="https://img.shields.io/npm/v/@agentic/platform-api-client.svg" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

> [!NOTE]
> This package is a fork of [@cfworker/json-schema](https://github.com/cfworker/cfworker) which adds support for [ajv-style type coercion](https://ajv.js.org/coercion.html). Coercion is disabled by default, but can be enabled with a boolean flag.

# @agentic/json-schema

![](https://badgen.net/bundlephobia/minzip/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/min/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/dependency-count/@cfworker/json-schema)
![](https://badgen.net/bundlephobia/tree-shaking/@cfworker/json-schema)
![](https://badgen.net/npm/types/@cfworker/json-schema?icon=typescript)

A JSON schema validator that will run on Cloudflare workers. Supports drafts 4, 7, 2019-09, and 2020-12.

This library is validated against the [json-schema-test-suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite), a series of approximately 4,500 assertions maintained along with the json-schema specification. A small set of test cases are intentionally not supported due to performance constraints or lack of feature use. These list of unsupported features are maintained in [test/unsupported.ts](./test/unsupported.ts). While this library is not the fastest due to lack of code generation, it's consistently among the [most spec compliant](https://json-schema.org/implementations.html#benchmarks).

## Background

_Why another JSON schema validator?_

Cloudflare workers do not have APIs required by [Ajv](https://ajv.js.org/) schema compilation (`eval` or `new Function(code)`).
If possible use Ajv in a build step to precompile your schema. Otherwise this library could work for you.

## Basic usage

```js
import { Validator } from '@cfworker/json-schema'

const validator = new Validator({ type: 'number' })

const result = validator.validate(7)
```

## Specify meta schema draft

```js
const validator = new Validator({ type: 'number' }, '4') // draft-4
```

## Add schemas

```js
const validator = new Validator({
  $id: 'https://foo.bar/baz',
  $ref: '/beep'
})

validator.addSchema({ $id: 'https://foo.bar/beep', type: 'boolean' })
```

## Include all errors

By default the validator stops processing after the first error. Set the `shortCircuit` parameter to `false` to emit all errors.

```js
const shortCircuit = false;

const draft = '2019-09';

const schema = {
  type: 'object',
  required: ['name', 'email', 'number', 'bool'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    number: { type: 'number' },
    bool: { type: 'boolean' }
  }
};

const validator = new Validator(schema, draft, shortCircuit);

const result = validator.validate({
  name: 'hello',
  email: 5, // invalid type
  number: 'Hello' // invalid type
  bool: 'false' // invalid type
});
```
