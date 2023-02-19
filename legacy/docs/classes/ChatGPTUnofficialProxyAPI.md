[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTUnofficialProxyAPI

# Class: ChatGPTUnofficialProxyAPI

## Table of contents

### Constructors

- [constructor](ChatGPTUnofficialProxyAPI.md#constructor)

### Accessors

- [accessToken](ChatGPTUnofficialProxyAPI.md#accesstoken)

### Methods

- [sendMessage](ChatGPTUnofficialProxyAPI.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTUnofficialProxyAPI**(`opts`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.accessToken` | `string` | - |
| `opts.apiReverseProxyUrl?` | `string` | **`Default Value`** `https://chat.openai.com/backend-api/conversation` * |
| `opts.debug?` | `boolean` | **`Default Value`** `false` * |
| `opts.fetch?` | (`input`: `RequestInfo` \| `URL`, `init?`: `RequestInit`) => `Promise`<`Response`\> | - |
| `opts.headers?` | `Record`<`string`, `string`\> | **`Default Value`** `undefined` * |
| `opts.model?` | `string` | **`Default Value`** `text-davinci-002-render-sha` * |

#### Defined in

[src/chatgpt-unofficial-proxy-api.ts:19](https://github.com/transitive-bullshit/chatgpt-api/blob/6cf60ee/src/chatgpt-unofficial-proxy-api.ts#L19)

## Accessors

### accessToken

• `get` **accessToken**(): `string`

#### Returns

`string`

#### Defined in

[src/chatgpt-unofficial-proxy-api.ts:65](https://github.com/transitive-bullshit/chatgpt-api/blob/6cf60ee/src/chatgpt-unofficial-proxy-api.ts#L65)

• `set` **accessToken**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`void`

#### Defined in

[src/chatgpt-unofficial-proxy-api.ts:69](https://github.com/transitive-bullshit/chatgpt-api/blob/6cf60ee/src/chatgpt-unofficial-proxy-api.ts#L69)

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
| `opts` | [`SendMessageBrowserOptions`](../modules.md#sendmessagebrowseroptions) |

#### Returns

`Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

The response from ChatGPT

#### Defined in

[src/chatgpt-unofficial-proxy-api.ts:96](https://github.com/transitive-bullshit/chatgpt-api/blob/6cf60ee/src/chatgpt-unofficial-proxy-api.ts#L96)
