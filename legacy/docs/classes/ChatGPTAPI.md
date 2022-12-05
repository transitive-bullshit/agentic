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

[chatgpt-api.ts:29](https://github.com/transitive-bullshit/chatgpt-api/blob/549e9b4/src/chatgpt-api.ts#L29)

## Methods

### ensureAuth

▸ **ensureAuth**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:72](https://github.com/transitive-bullshit/chatgpt-api/blob/549e9b4/src/chatgpt-api.ts#L72)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[chatgpt-api.ts:63](https://github.com/transitive-bullshit/chatgpt-api/blob/549e9b4/src/chatgpt-api.ts#L63)

___

### refreshAccessToken

▸ **refreshAccessToken**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:163](https://github.com/transitive-bullshit/chatgpt-api/blob/549e9b4/src/chatgpt-api.ts#L163)

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
| `opts.converstationId?` | `string` | - |
| `opts.onProgress?` | (`partialResponse`: `string`) => `void` | - |

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:84](https://github.com/transitive-bullshit/chatgpt-api/blob/549e9b4/src/chatgpt-api.ts#L84)
