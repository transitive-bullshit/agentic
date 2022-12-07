[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

### Methods

- [ensureAuth](ChatGPTAPI.md#ensureauth)
- [getConversation](ChatGPTAPI.md#getconversation)
- [getIsAuthenticated](ChatGPTAPI.md#getisauthenticated)
- [refreshAccessToken](ChatGPTAPI.md#refreshaccesstoken)
- [sendMessage](ChatGPTAPI.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTAPI**(`opts`)

Creates a new client wrapper around the unofficial ChatGPT REST API.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.apiBaseUrl?` | `string` | **`Default Value`**  `'https://chat.openai.com/api'` * |
| `opts.backendApiBaseUrl?` | `string` | **`Default Value`**  `'https://chat.openai.com/backend-api'` * |
| `opts.markdown?` | `boolean` | **`Default Value`**  `true` * |
| `opts.sessionToken` | `string` | = **Required** OpenAI session token which can be found in a valid session's cookies (see readme for instructions) |
| `opts.userAgent?` | `string` | **`Default Value`**  `'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'` * |

#### Defined in

[chatgpt-api.ts:32](https://github.com/transitive-bullshit/chatgpt-api/blob/8e045b2/src/chatgpt-api.ts#L32)

## Methods

### ensureAuth

▸ **ensureAuth**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:75](https://github.com/transitive-bullshit/chatgpt-api/blob/8e045b2/src/chatgpt-api.ts#L75)

___

### getConversation

▸ **getConversation**(`opts?`): [`ChatGPTConversation`](ChatGPTConversation.md)

Gets a new ChatGPTConversation instance, which can be used to send multiple
messages as part of a single conversation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.conversationId?` | `string` | Optional ID of the previous message in a conversation |
| `opts.parentMessageId?` | `string` | Optional ID of the previous message in a conversation |

#### Returns

[`ChatGPTConversation`](ChatGPTConversation.md)

The new conversation instance

#### Defined in

[chatgpt-api.ts:233](https://github.com/transitive-bullshit/chatgpt-api/blob/8e045b2/src/chatgpt-api.ts#L233)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[chatgpt-api.ts:66](https://github.com/transitive-bullshit/chatgpt-api/blob/8e045b2/src/chatgpt-api.ts#L66)

___

### refreshAccessToken

▸ **refreshAccessToken**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:183](https://github.com/transitive-bullshit/chatgpt-api/blob/8e045b2/src/chatgpt-api.ts#L183)

___

### sendMessage

▸ **sendMessage**(`message`, `opts?`): `Promise`<`string`\>

Sends a message to ChatGPT, waits for the response to resolve, and returns
the response.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The prompt message to send |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) | - |

#### Returns

`Promise`<`string`\>

The response from ChatGPT

#### Defined in

[chatgpt-api.ts:92](https://github.com/transitive-bullshit/chatgpt-api/blob/8e045b2/src/chatgpt-api.ts#L92)
