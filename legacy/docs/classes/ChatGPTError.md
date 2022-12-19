[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTError

# Class: ChatGPTError

## Hierarchy

- `Error`

  ↳ **`ChatGPTError`**

## Table of contents

### Constructors

- [constructor](ChatGPTError.md#constructor)

### Properties

- [originalError](ChatGPTError.md#originalerror)
- [response](ChatGPTError.md#response)
- [statusCode](ChatGPTError.md#statuscode)
- [statusText](ChatGPTError.md#statustext)

## Constructors

### constructor

• **new ChatGPTError**(`message?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |

#### Inherited from

Error.constructor

#### Defined in

node_modules/.pnpm/typescript@4.9.3/node_modules/typescript/lib/lib.es5.d.ts:1059

• **new ChatGPTError**(`message?`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `options?` | `ErrorOptions` |

#### Inherited from

Error.constructor

#### Defined in

node_modules/.pnpm/typescript@4.9.3/node_modules/typescript/lib/lib.es2022.error.d.ts:30

## Properties

### originalError

• `Optional` **originalError**: `Error`

#### Defined in

[src/types.ts:297](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/types.ts#L297)

___

### response

• `Optional` **response**: `Response`

#### Defined in

[src/types.ts:296](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/types.ts#L296)

___

### statusCode

• `Optional` **statusCode**: `number`

#### Defined in

[src/types.ts:294](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/types.ts#L294)

___

### statusText

• `Optional` **statusText**: `string`

#### Defined in

[src/types.ts:295](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/types.ts#L295)
