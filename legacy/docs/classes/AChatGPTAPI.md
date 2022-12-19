[chatgpt](../readme.md) / [Exports](../modules.md) / AChatGPTAPI

# Class: AChatGPTAPI

## Hierarchy

- **`AChatGPTAPI`**

  ↳ [`ChatGPTAPI`](ChatGPTAPI.md)

  ↳ [`ChatGPTAPIBrowser`](ChatGPTAPIBrowser.md)

## Table of contents

### Constructors

- [constructor](AChatGPTAPI.md#constructor)

### Methods

- [closeSession](AChatGPTAPI.md#closesession)
- [getIsAuthenticated](AChatGPTAPI.md#getisauthenticated)
- [initSession](AChatGPTAPI.md#initsession)
- [refreshSession](AChatGPTAPI.md#refreshsession)
- [resetSession](AChatGPTAPI.md#resetsession)
- [sendMessage](AChatGPTAPI.md#sendmessage)

## Constructors

### constructor

• **new AChatGPTAPI**()

## Methods

### closeSession

▸ `Abstract` **closeSession**(): `Promise`<`void`\>

Closes the active session.

**`Throws`**

An error if it fails.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/abstract-chatgpt-api.ts:69](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/abstract-chatgpt-api.ts#L69)

___

### getIsAuthenticated

▸ `Abstract` **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

`true` if the client is authenticated with a valid session or `false`
otherwise.

#### Defined in

[src/abstract-chatgpt-api.ts:39](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/abstract-chatgpt-api.ts#L39)

___

### initSession

▸ `Abstract` **initSession**(): `Promise`<`void`\>

Performs any async initialization work required to ensure that this API is
properly authenticated.

**`Throws`**

An error if the session failed to initialize properly.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/abstract-chatgpt-api.ts:10](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/abstract-chatgpt-api.ts#L10)

___

### refreshSession

▸ `Abstract` **refreshSession**(): `Promise`<`any`\>

Refreshes the current ChatGPT session.

Useful for bypassing 403 errors when Cloudflare clearance tokens expire.

**`Throws`**

An error if it fails.

#### Returns

`Promise`<`any`\>

Access credentials for the new session.

#### Defined in

[src/abstract-chatgpt-api.ts:49](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/abstract-chatgpt-api.ts#L49)

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

#### Defined in

[src/abstract-chatgpt-api.ts:59](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/abstract-chatgpt-api.ts#L59)

___

### sendMessage

▸ `Abstract` **sendMessage**(`message`, `opts?`): `Promise`<[`ChatResponse`](../modules.md#chatresponse)\>

Sends a message to ChatGPT, waits for the response to resolve, and returns
the response.

If you want to receive a stream of partial responses, use `opts.onProgress`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The prompt message to send |
| `opts?` | [`SendMessageOptions`](../modules.md#sendmessageoptions) | - |

#### Returns

`Promise`<[`ChatResponse`](../modules.md#chatresponse)\>

The response from ChatGPT, including `conversationId`, `messageId`, and
the `response` text.

#### Defined in

[src/abstract-chatgpt-api.ts:30](https://github.com/transitive-bullshit/chatgpt-api/blob/7222b7f/src/abstract-chatgpt-api.ts#L30)
