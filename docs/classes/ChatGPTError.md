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

[src/types.ts:80](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L80)

___

### isFinal

• `Optional` **isFinal**: `boolean`

#### Defined in

[src/types.ts:79](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L79)

___

### statusCode

• `Optional` **statusCode**: `number`

#### Defined in

[src/types.ts:77](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L77)

___

### statusText

• `Optional` **statusText**: `string`

#### Defined in

[src/types.ts:78](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L78)
