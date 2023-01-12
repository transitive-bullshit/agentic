[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

## Hierarchy

- [`AChatGPTAPI`](AChatGPTAPI.md)

  ↳ **`ChatGPTAPI`**

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

### Accessors

- [clearanceToken](ChatGPTAPI.md#clearancetoken)
- [sessionToken](ChatGPTAPI.md#sessiontoken)
- [user](ChatGPTAPI.md#user)
- [userAgent](ChatGPTAPI.md#useragent)

### Methods

- [closeSession](ChatGPTAPI.md#closesession)
- [getIsAuthenticated](ChatGPTAPI.md#getisauthenticated)
- [initSession](ChatGPTAPI.md#initsession)
- [refreshSession](ChatGPTAPI.md#refreshsession)
- [resetSession](ChatGPTAPI.md#resetsession)
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

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[constructor](AChatGPTAPI.md#constructor)

#### Defined in

[src/chatgpt-api.ts:45](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L45)

## Accessors

### clearanceToken

• `get` **clearanceToken**(): `string`

Gets the current Cloudflare clearance token (`cf_clearance` cookie value).

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:143](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L143)

___

### sessionToken

• `get` **sessionToken**(): `string`

Gets the current session token.

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:138](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L138)

___

### user

• `get` **user**(): [`User`](../modules.md#user)

Gets the currently signed-in user, if authenticated, `null` otherwise.

#### Returns

[`User`](../modules.md#user)

#### Defined in

[src/chatgpt-api.ts:133](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L133)

___

### userAgent

• `get` **userAgent**(): `string`

Gets the current user agent.

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:148](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L148)

## Methods

### closeSession

▸ **closeSession**(): `Promise`<`void`\>

Closes the active session.

**`Throws`**

An error if it fails.

#### Returns

`Promise`<`void`\>

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[closeSession](AChatGPTAPI.md#closesession)

#### Defined in

[src/chatgpt-api.ts:470](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L470)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

`true` if the client has a valid acces token or `false` if refreshing
the token fails.

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[getIsAuthenticated](AChatGPTAPI.md#getisauthenticated)

#### Defined in

[src/chatgpt-api.ts:367](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L367)

___

### initSession

▸ **initSession**(): `Promise`<`void`\>

Refreshes the client's access token which will succeed only if the session
is valid.

#### Returns

`Promise`<`void`\>

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[initSession](AChatGPTAPI.md#initsession)

#### Defined in

[src/chatgpt-api.ts:156](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L156)

___

### refreshSession

▸ **refreshSession**(): `Promise`<`string`\>

Attempts to refresh the current access token using the ChatGPT
`sessionToken` cookie.

Access tokens will be cached for up to `accessTokenTTL` milliseconds to
prevent refreshing access tokens too frequently.

**`Throws`**

An error if refreshing the access token fails.

#### Returns

`Promise`<`string`\>

A valid access token

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[refreshSession](AChatGPTAPI.md#refreshsession)

#### Defined in

[src/chatgpt-api.ts:386](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L386)

___

### resetSession

▸ **resetSession**(): `Promise`<`any`\>

Closes the current ChatGPT session and starts a new one.

Useful for bypassing 401 errors when sessions expire.

**`Throws`**

An error if it fails.

#### Returns

`Promise`<`any`\>

Access credentials for the new session.

#### Inherited from

[AChatGPTAPI](AChatGPTAPI.md).[resetSession](AChatGPTAPI.md#resetsession)

#### Defined in

[src/abstract-chatgpt-api.ts:59](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/abstract-chatgpt-api.ts#L59)

___

### sendMessage

▸ **sendMessage**(`message`, `opts?`): `Promise`<[`ChatResponse`](../modules.md#chatresponse)\>

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

`Promise`<[`ChatResponse`](../modules.md#chatresponse)\>

The response from ChatGPT

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[sendMessage](AChatGPTAPI.md#sendmessage)

#### Defined in

[src/chatgpt-api.ts:180](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L180)

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

[src/chatgpt-api.ts:324](https://github.com/transitive-bullshit/chatgpt-api/blob/4a0f780/src/chatgpt-api.ts#L324)
