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
| `opts.accessTokenTTL?` | `number` | **`Default Value`**  60000 (60 seconds) |
| `opts.apiBaseUrl?` | `string` | **`Default Value`**  `'https://chat.openai.com/api'` * |
| `opts.backendApiBaseUrl?` | `string` | **`Default Value`**  `'https://chat.openai.com/backend-api'` * |
| `opts.markdown?` | `boolean` | **`Default Value`**  `true` * |
| `opts.sessionToken` | `string` | = **Required** OpenAI session token which can be found in a valid session's cookies (see readme for instructions) |
| `opts.userAgent?` | `string` | **`Default Value`**  `'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'` * |

#### Defined in

[chatgpt-api.ts:35](https://github.com/transitive-bullshit/chatgpt-api/blob/20c376e/src/chatgpt-api.ts#L35)

## Methods

### ensureAuth

▸ **ensureAuth**(): `Promise`<`string`\>

Refreshes the client's access token which will succeed only if the session
is still valid.

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:221](https://github.com/transitive-bullshit/chatgpt-api/blob/20c376e/src/chatgpt-api.ts#L221)

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

[chatgpt-api.ts:285](https://github.com/transitive-bullshit/chatgpt-api/blob/20c376e/src/chatgpt-api.ts#L285)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

`true` if the client has a valid acces token or `false` if refreshing
the token fails.

#### Defined in

[chatgpt-api.ts:208](https://github.com/transitive-bullshit/chatgpt-api/blob/20c376e/src/chatgpt-api.ts#L208)

___

### refreshAccessToken

▸ **refreshAccessToken**(): `Promise`<`string`\>

Attempts to refresh the current access token using the ChatGPT
`sessionToken` cookie.

Access tokens will be cached for up to `accessTokenTTL` milliseconds to
prevent refreshing access tokens too frequently.

**`Throws`**

An error if refreshing the access token fails.

#### Returns

`Promise`<`string`\>

A valid access token

#### Defined in

[chatgpt-api.ts:235](https://github.com/transitive-bullshit/chatgpt-api/blob/20c376e/src/chatgpt-api.ts#L235)

___

### sendMessage

▸ **sendMessage**(`message`, `opts?`): `Promise`<`string`\>

Sends a message to ChatGPT, waits for the response to resolve, and returns
the response.

If you want to receive a stream of partial responses, use `opts.onProgress`.
If you want to receive the full response, including message and conversation IDs,
you can use `opts.onConversationResponse` or use the `ChatGPTAPI.getConversation`
helper.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The prompt message to send |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) | - |

#### Returns

`Promise`<`string`\>

The response from ChatGPT

#### Defined in

[chatgpt-api.ts:94](https://github.com/transitive-bullshit/chatgpt-api/blob/20c376e/src/chatgpt-api.ts#L94)
