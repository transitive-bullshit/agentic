[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

### Accessors

- [clearanceToken](ChatGPTAPI.md#clearancetoken)
- [sessionToken](ChatGPTAPI.md#sessiontoken)
- [user](ChatGPTAPI.md#user)
- [userAgent](ChatGPTAPI.md#useragent)

### Methods

- [ensureAuth](ChatGPTAPI.md#ensureauth)
- [getConversation](ChatGPTAPI.md#getconversation)
- [getIsAuthenticated](ChatGPTAPI.md#getisauthenticated)
- [refreshAccessToken](ChatGPTAPI.md#refreshaccesstoken)
- [sendMessage](ChatGPTAPI.md#sendmessage)
- [sendModeration](ChatGPTAPI.md#sendmoderation)

## Constructors

### constructor

• **new ChatGPTAPI**(`opts`)

Creates a new client wrapper around the unofficial ChatGPT REST API.

Note that your IP address and `userAgent` must match the same values that you used
to obtain your `clearanceToken`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.accessToken?` | `string` | **`Default Value`**  `undefined` * |
| `opts.accessTokenTTL?` | `number` | **`Default Value`**  1 hour * |
| `opts.apiBaseUrl?` | `string` | **`Default Value`**  `'https://chat.openai.com/api'` * |
| `opts.backendApiBaseUrl?` | `string` | **`Default Value`**  `'https://chat.openai.com/backend-api'` * |
| `opts.clearanceToken` | `string` | = **Required** Cloudflare `cf_clearance` cookie value (see readme for instructions) |
| `opts.debug?` | `boolean` | **`Default Value`**  `false` * |
| `opts.headers?` | `Record`<`string`, `string`\> | **`Default Value`**  `undefined` * |
| `opts.markdown?` | `boolean` | **`Default Value`**  `true` * |
| `opts.sessionToken` | `string` | = **Required** OpenAI session token which can be found in a valid session's cookies (see readme for instructions) |
| `opts.userAgent?` | `string` | **`Default Value`**  `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'` * |

#### Defined in

[src/chatgpt-api.ts:45](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L45)

## Accessors

### clearanceToken

• `get` **clearanceToken**(): `string`

Gets the current Cloudflare clearance token (`cf_clearance` cookie value).

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:137](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L137)

___

### sessionToken

• `get` **sessionToken**(): `string`

Gets the current session token.

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:132](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L132)

___

### user

• `get` **user**(): [`User`](../modules.md#user)

Gets the currently signed-in user, if authenticated, `null` otherwise.

#### Returns

[`User`](../modules.md#user)

#### Defined in

[src/chatgpt-api.ts:127](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L127)

___

### userAgent

• `get` **userAgent**(): `string`

Gets the current user agent.

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:142](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L142)

## Methods

### ensureAuth

▸ **ensureAuth**(): `Promise`<`string`\>

Refreshes the client's access token which will succeed only if the session
is still valid.

#### Returns

`Promise`<`string`\>

#### Defined in

[src/chatgpt-api.ts:359](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L359)

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

[src/chatgpt-api.ts:465](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L465)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

`true` if the client has a valid acces token or `false` if refreshing
the token fails.

#### Defined in

[src/chatgpt-api.ts:346](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L346)

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

[src/chatgpt-api.ts:373](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L373)

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

[src/chatgpt-api.ts:167](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L167)

___

### sendModeration

▸ **sendModeration**(`input`): `Promise`<[`ModerationsJSONResult`](../modules.md#moderationsjsonresult)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`Promise`<[`ModerationsJSONResult`](../modules.md#moderationsjsonresult)\>

#### Defined in

[src/chatgpt-api.ts:303](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api.ts#L303)
