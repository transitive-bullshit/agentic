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
| `opts.completionParams?` | [`CompletionParams`](../modules/openai.md#completionparams) | - |
| `opts.debug?` | `boolean` | **`Default Value`** `false` * |
| `opts.getMessageById?` | [`GetMessageByIdFunction`](../modules.md#getmessagebyidfunction) | - |
| `opts.messageStore?` | `Keyv`<`any`, `Record`<`string`, `unknown`\>\> | - |
| `opts.upsertMessage?` | [`UpsertMessageFunction`](../modules.md#upsertmessagefunction) | - |

#### Defined in

[src/chatgpt-api.ts:36](https://github.com/transitive-bullshit/chatgpt-api/blob/531e180/src/chatgpt-api.ts#L36)

## Methods

### sendMessage

▸ **sendMessage**(`text`, `opts?`): `Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Sends a message to ChatGPT, waits for the response to resolve, and returns
the response.

If you want to receive a stream of partial responses, use `opts.onProgress`.
If you want to receive the full response, including message and conversation IDs,
you can use `opts.onConversationResponse` or use the `ChatGPTAPI.getConversation`
helper.

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) |

#### Returns

`Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

The response from ChatGPT

#### Defined in

[src/chatgpt-api.ts:109](https://github.com/transitive-bullshit/chatgpt-api/blob/531e180/src/chatgpt-api.ts#L109)
