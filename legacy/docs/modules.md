[chatgpt](readme.md) / Exports

# chatgpt

## Table of contents

### Namespaces

- [openai](modules/openai.md)

### Classes

- [ChatGPTAPI](classes/ChatGPTAPI.md)
- [ChatGPTError](classes/ChatGPTError.md)

### Interfaces

- [ChatMessage](interfaces/ChatMessage.md)

### Type Aliases

- [FetchFn](modules.md#fetchfn)
- [GetMessageByIdFunction](modules.md#getmessagebyidfunction)
- [Role](modules.md#role)
- [SendMessageOptions](modules.md#sendmessageoptions)
- [UpsertMessageFunction](modules.md#upsertmessagefunction)

## Type Aliases

### FetchFn

Ƭ **FetchFn**: typeof `fetch`

#### Defined in

[src/types.ts:3](https://github.com/transitive-bullshit/chatgpt-api/blob/4379d52/src/types.ts#L3)

___

### GetMessageByIdFunction

Ƭ **GetMessageByIdFunction**: (`id`: `string`) => `Promise`<[`ChatMessage`](interfaces/ChatMessage.md)\>

#### Type declaration

▸ (`id`): `Promise`<[`ChatMessage`](interfaces/ChatMessage.md)\>

Returns a chat message from a store by it's ID (or null if not found).

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`Promise`<[`ChatMessage`](interfaces/ChatMessage.md)\>

#### Defined in

[src/types.ts:32](https://github.com/transitive-bullshit/chatgpt-api/blob/4379d52/src/types.ts#L32)

___

### Role

Ƭ **Role**: ``"user"`` \| ``"assistant"``

#### Defined in

[src/types.ts:1](https://github.com/transitive-bullshit/chatgpt-api/blob/4379d52/src/types.ts#L1)

___

### SendMessageOptions

Ƭ **SendMessageOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `abortSignal?` | `AbortSignal` |
| `conversationId?` | `string` |
| `messageId?` | `string` |
| `onProgress?` | (`partialResponse`: [`ChatMessage`](interfaces/ChatMessage.md)) => `void` |
| `parentMessageId?` | `string` |
| `promptPrefix?` | `string` |
| `promptSuffix?` | `string` |
| `stream?` | `boolean` |
| `timeoutMs?` | `number` |

#### Defined in

[src/types.ts:5](https://github.com/transitive-bullshit/chatgpt-api/blob/4379d52/src/types.ts#L5)

___

### UpsertMessageFunction

Ƭ **UpsertMessageFunction**: (`message`: [`ChatMessage`](interfaces/ChatMessage.md)) => `Promise`<`void`\>

#### Type declaration

▸ (`message`): `Promise`<`void`\>

Upserts a chat message to a store.

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | [`ChatMessage`](interfaces/ChatMessage.md) |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/types.ts:35](https://github.com/transitive-bullshit/chatgpt-api/blob/4379d52/src/types.ts#L35)
