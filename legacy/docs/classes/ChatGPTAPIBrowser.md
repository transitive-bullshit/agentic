[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPIBrowser

# Class: ChatGPTAPIBrowser

## Hierarchy

- [`AChatGPTAPI`](AChatGPTAPI.md)

  ↳ **`ChatGPTAPIBrowser`**

## Table of contents

### Constructors

- [constructor](ChatGPTAPIBrowser.md#constructor)

### Accessors

- [isChatPage](ChatGPTAPIBrowser.md#ischatpage)

### Methods

- [\_onRequest](ChatGPTAPIBrowser.md#_onrequest)
- [\_onResponse](ChatGPTAPIBrowser.md#_onresponse)
- [closeSession](ChatGPTAPIBrowser.md#closesession)
- [getIsAuthenticated](ChatGPTAPIBrowser.md#getisauthenticated)
- [initSession](ChatGPTAPIBrowser.md#initsession)
- [refreshSession](ChatGPTAPIBrowser.md#refreshsession)
- [resetSession](ChatGPTAPIBrowser.md#resetsession)
- [resetThread](ChatGPTAPIBrowser.md#resetthread)
- [sendMessage](ChatGPTAPIBrowser.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTAPIBrowser**(`opts`)

Creates a new client for automating the ChatGPT webapp.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.captchaToken?` | `string` | **`Default Value`**  `undefined` * |
| `opts.debug?` | `boolean` | **`Default Value`**  `false` * |
| `opts.email` | `string` | - |
| `opts.executablePath?` | `string` | **`Default Value`**  `undefined` * |
| `opts.isGoogleLogin?` | `boolean` | **`Default Value`**  `false` * |
| `opts.isMicrosoftLogin?` | `boolean` | **`Default Value`**  `false` * |
| `opts.markdown?` | `boolean` | **`Default Value`**  `true` * |
| `opts.minimize?` | `boolean` | **`Default Value`**  `true` * |
| `opts.nopechaKey?` | `string` | **`Default Value`**  `undefined` * |
| `opts.password` | `string` | - |
| `opts.proxyServer?` | `string` | **`Default Value`**  `undefined` * |

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[constructor](AChatGPTAPI.md#constructor)

#### Defined in

[src/chatgpt-api-browser.ts:40](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L40)

## Accessors

### isChatPage

• `get` **isChatPage**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/chatgpt-api-browser.ts:696](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L696)

## Methods

### \_onRequest

▸ **_onRequest**(`request`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | `HTTPRequest` |

#### Returns

`void`

#### Defined in

[src/chatgpt-api-browser.ts:218](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L218)

___

### \_onResponse

▸ **_onResponse**(`response`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `response` | `HTTPResponse` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:255](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L255)

___

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

[src/chatgpt-api-browser.ts:642](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L642)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

`true` if the client is authenticated with a valid session or `false`
otherwise.

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[getIsAuthenticated](AChatGPTAPI.md#getisauthenticated)

#### Defined in

[src/chatgpt-api-browser.ts:391](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L391)

___

### initSession

▸ **initSession**(): `Promise`<`void`\>

Performs any async initialization work required to ensure that this API is
properly authenticated.

**`Throws`**

An error if the session failed to initialize properly.

#### Returns

`Promise`<`void`\>

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[initSession](AChatGPTAPI.md#initsession)

#### Defined in

[src/chatgpt-api-browser.ts:114](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L114)

___

### refreshSession

▸ **refreshSession**(): `Promise`<`void`\>

Attempts to handle 403 errors by refreshing the page.

#### Returns

`Promise`<`void`\>

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[refreshSession](AChatGPTAPI.md#refreshsession)

#### Defined in

[src/chatgpt-api-browser.ts:333](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L333)

___

### resetSession

▸ **resetSession**(): `Promise`<`void`\>

Attempts to handle 401 errors by re-authenticating.

#### Returns

`Promise`<`void`\>

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[resetSession](AChatGPTAPI.md#resetsession)

#### Defined in

[src/chatgpt-api-browser.ts:314](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L314)

___

### resetThread

▸ **resetThread**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:634](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L634)

___

### sendMessage

▸ **sendMessage**(`message`, `opts?`): `Promise`<[`ChatResponse`](../modules.md#chatresponse)\>

Sends a message to ChatGPT, waits for the response to resolve, and returns
the response.

If you want to receive a stream of partial responses, use `opts.onProgress`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The prompt message to send |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) | - |

#### Returns

`Promise`<[`ChatResponse`](../modules.md#chatresponse)\>

The response from ChatGPT, including `conversationId`, `messageId`, and
the `response` text.

#### Overrides

[AChatGPTAPI](AChatGPTAPI.md).[sendMessage](AChatGPTAPI.md#sendmessage)

#### Defined in

[src/chatgpt-api-browser.ts:468](https://github.com/transitive-bullshit/chatgpt-api/blob/025e7e3/src/chatgpt-api-browser.ts#L468)
