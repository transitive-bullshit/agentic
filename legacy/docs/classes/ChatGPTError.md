[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTError

# Class: ChatGPTError

## Hierarchy

- `Error`

  ↳ **`ChatGPTError`**

## Table of contents

### Constructors

- [constructor](ChatGPTError.md#constructor)

### Properties

- [accountId](ChatGPTError.md#accountid)
- [isFinal](ChatGPTError.md#isfinal)
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

node_modules/.pnpm/typescript@4.9.5/node_modules/typescript/lib/lib.es5.d.ts:1059

• **new ChatGPTError**(`message?`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `options?` | `ErrorOptions` |

#### Inherited from

Error.constructor

#### Defined in

node_modules/.pnpm/typescript@4.9.5/node_modules/typescript/lib/lib.es2022.error.d.ts:30

## Properties

### accountId

• `Optional` **accountId**: `string`

#### Defined in

[src/types.ts:47](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L47)

___

### isFinal

• `Optional` **isFinal**: `boolean`

#### Defined in

[src/types.ts:46](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L46)

___

### statusCode

• `Optional` **statusCode**: `number`

#### Defined in

[src/types.ts:44](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L44)

___

### statusText

• `Optional` **statusText**: `string`

#### Defined in

[src/types.ts:45](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L45)
