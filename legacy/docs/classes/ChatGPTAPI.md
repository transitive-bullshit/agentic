[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

### Methods

- [ensureAuth](ChatGPTAPI.md#ensureauth)
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

[chatgpt-api.ts:31](https://github.com/transitive-bullshit/chatgpt-api/blob/c9cef79/src/chatgpt-api.ts#L31)

## Methods

### ensureAuth

▸ **ensureAuth**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:74](https://github.com/transitive-bullshit/chatgpt-api/blob/c9cef79/src/chatgpt-api.ts#L74)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[chatgpt-api.ts:65](https://github.com/transitive-bullshit/chatgpt-api/blob/c9cef79/src/chatgpt-api.ts#L65)

___

### refreshAccessToken

▸ **refreshAccessToken**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:165](https://github.com/transitive-bullshit/chatgpt-api/blob/c9cef79/src/chatgpt-api.ts#L165)

___

### sendMessage

▸ **sendMessage**(`message`, `opts?`): `Promise`<`string`\>

Sends a message to ChatGPT, waits for the response to resolve, and returns
the response.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The plaintext message to send. |
| `opts` | `Object` | - |
| `opts.conversationId?` | `string` | - |
| `opts.onProgress?` | (`partialResponse`: `string`) => `void` | - |

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:86](https://github.com/transitive-bullshit/chatgpt-api/blob/c9cef79/src/chatgpt-api.ts#L86)
