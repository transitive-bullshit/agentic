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

Creates a new client wrapper around OpenAI's completion API using the
unofficial ChatGPT model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.apiBaseUrl?` | `string` | **`Default Value`** `'https://api.openai.com'` * |
| `opts.apiKey` | `string` | - |
| `opts.apiReverseProxyUrl?` | `string` | **`Default Value`** `undefined` * |
| `opts.assistantLabel?` | `string` | **`Default Value`** `'ChatGPT'` * |
| `opts.completionParams?` | `Partial`<[`CompletionParams`](../modules/openai.md#completionparams)\> | - |
| `opts.debug?` | `boolean` | **`Default Value`** `false` * |
| `opts.fetch?` | (`input`: `RequestInfo` \| `URL`, `init?`: `RequestInit`) => `Promise`<`Response`\> | - |
| `opts.getMessageById?` | [`GetMessageByIdFunction`](../modules.md#getmessagebyidfunction) | - |
| `opts.maxModelTokens?` | `number` | **`Default Value`** `4096` * |
| `opts.maxResponseTokens?` | `number` | **`Default Value`** `1000` * |
| `opts.messageStore?` | `Keyv`<`any`, `Record`<`string`, `unknown`\>\> | - |
| `opts.upsertMessage?` | [`UpsertMessageFunction`](../modules.md#upsertmessagefunction) | - |
| `opts.userLabel?` | `string` | **`Default Value`** `'User'` * |

#### Defined in

[src/chatgpt-api.ts:53](https://github.com/transitive-bullshit/chatgpt-api/blob/607fccf/src/chatgpt-api.ts#L53)

## Accessors

### apiKey

• `get` **apiKey**(): `string`

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:353](https://github.com/transitive-bullshit/chatgpt-api/blob/607fccf/src/chatgpt-api.ts#L353)

• `set` **apiKey**(`apiKey`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `apiKey` | `string` |

#### Returns

`void`

#### Defined in

[src/chatgpt-api.ts:357](https://github.com/transitive-bullshit/chatgpt-api/blob/607fccf/src/chatgpt-api.ts#L357)

## Methods

### sendMessage

▸ **sendMessage**(`text`, `opts?`): `Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Sends a message to ChatGPT, waits for the response to resolve, and returns
the response.

If you want your response to have historical context, you must provide a valid `parentMessageId`.

If you want to receive a stream of partial responses, use `opts.onProgress`.
If you want to receive the full response, including message and conversation IDs,
you can use `opts.onConversationResponse` or use the `ChatGPTAPI.getConversation`
helper.

Set `debug: true` in the `ChatGPTAPI` constructor to log more info on the full prompt sent to the OpenAI completions API. You can override the `promptPrefix` and `promptSuffix` in `opts` to customize the prompt.

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) |

#### Returns

`Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

The response from ChatGPT

#### Defined in

[src/chatgpt-api.ts:185](https://github.com/transitive-bullshit/chatgpt-api/blob/607fccf/src/chatgpt-api.ts#L185)
