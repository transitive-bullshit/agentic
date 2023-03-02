[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

### Accessors

- [apiKey](ChatGPTAPI.md#apikey)

### Methods

- [sendMessage](ChatGPTAPI.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTAPI**(`opts`)

Creates a new client wrapper around OpenAI's chat completion API, mimicing the official ChatGPT webapp's functionality as closely as possible.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.apiBaseUrl?` | `string` | **`Default Value`** `'https://api.openai.com'` * |
| `opts.apiKey` | `string` | - |
| `opts.completionParams?` | `Partial`<`Omit`<[`CreateChatCompletionRequest`](../interfaces/openai.CreateChatCompletionRequest.md), ``"messages"`` \| ``"n"``\>\> | - |
| `opts.debug?` | `boolean` | **`Default Value`** `false` * |
| `opts.fetch?` | (`input`: `RequestInfo` \| `URL`, `init?`: `RequestInit`) => `Promise`<`Response`\> | - |
| `opts.getMessageById?` | [`GetMessageByIdFunction`](../modules.md#getmessagebyidfunction) | - |
| `opts.maxModelTokens?` | `number` | **`Default Value`** `4096` * |
| `opts.maxResponseTokens?` | `number` | **`Default Value`** `1000` * |
| `opts.messageStore?` | `Keyv`<`any`, `Record`<`string`, `unknown`\>\> | - |
| `opts.systemMessage?` | `string` | - |
| `opts.upsertMessage?` | [`UpsertMessageFunction`](../modules.md#upsertmessagefunction) | - |

#### Defined in

[src/chatgpt-api.ts:49](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/chatgpt-api.ts#L49)

## Accessors

### apiKey

• `get` **apiKey**(): `string`

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:336](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/chatgpt-api.ts#L336)

• `set` **apiKey**(`apiKey`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `apiKey` | `string` |

#### Returns

`void`

#### Defined in

[src/chatgpt-api.ts:340](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/chatgpt-api.ts#L340)

## Methods

### sendMessage

▸ **sendMessage**(`text`, `opts?`): `Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Sends a message to the OpenAI chat completions endpoint, waits for the response
to resolve, and returns the response.

If you want your response to have historical context, you must provide a valid `parentMessageId`.

If you want to receive a stream of partial responses, use `opts.onProgress`.

Set `debug: true` in the `ChatGPTAPI` constructor to log more info on the full prompt sent to the OpenAI chat completions API. You can override the `systemMessage` in `opts` to customize the assistant's instructions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) |

#### Returns

`Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

The response from ChatGPT

#### Defined in

[src/chatgpt-api.ts:157](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/chatgpt-api.ts#L157)
