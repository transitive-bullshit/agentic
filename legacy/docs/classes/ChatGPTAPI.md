[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

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
| `opts.assistantLabel?` | `string` | **`Default Value`** `'ChatGPT'` * |
| `opts.completionParams?` | [`CompletionParams`](../modules/openai.md#completionparams) | - |
| `opts.debug?` | `boolean` | **`Default Value`** `false` * |
| `opts.getMessageById?` | [`GetMessageByIdFunction`](../modules.md#getmessagebyidfunction) | - |
| `opts.maxModelTokens?` | `number` | **`Default Value`** `4096` * |
| `opts.maxResponseTokens?` | `number` | **`Default Value`** `1000` * |
| `opts.messageStore?` | `Keyv`<`any`, `Record`<`string`, `unknown`\>\> | - |
| `opts.upsertMessage?` | [`UpsertMessageFunction`](../modules.md#upsertmessagefunction) | - |
| `opts.userLabel?` | `string` | **`Default Value`** `'User'` * |

#### Defined in

[src/chatgpt-api.ts:47](https://github.com/transitive-bullshit/chatgpt-api/blob/2dd0ca9/src/chatgpt-api.ts#L47)

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

[src/chatgpt-api.ts:145](https://github.com/transitive-bullshit/chatgpt-api/blob/2dd0ca9/src/chatgpt-api.ts#L145)
