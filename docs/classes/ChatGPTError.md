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

node_modules/.pnpm/typescript@5.0.3/node_modules/typescript/lib/lib.es5.d.ts:1060

• **new ChatGPTError**(`message?`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message?` | `string` |
| `options?` | `ErrorOptions` |

#### Inherited from

Error.constructor

#### Defined in

node_modules/.pnpm/typescript@5.0.3/node_modules/typescript/lib/lib.es2022.error.d.ts:28

## Properties

### accountId

• `Optional` **accountId**: `string`

#### Defined in

[src/types.ts:86](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L86)

___

### isFinal

• `Optional` **isFinal**: `boolean`

#### Defined in

[src/types.ts:85](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L85)

___

### statusCode

• `Optional` **statusCode**: `number`

#### Defined in

[src/types.ts:83](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L83)

___

### statusText

• `Optional` **statusText**: `string`

#### Defined in

[src/types.ts:84](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L84)
