[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPIBrowser

# Class: ChatGPTAPIBrowser

## Table of contents

### Constructors

- [constructor](ChatGPTAPIBrowser.md#constructor)

### Methods

- [\_onRequest](ChatGPTAPIBrowser.md#_onrequest)
- [\_onResponse](ChatGPTAPIBrowser.md#_onresponse)
- [close](ChatGPTAPIBrowser.md#close)
- [getIsAuthenticated](ChatGPTAPIBrowser.md#getisauthenticated)
- [handle403Error](ChatGPTAPIBrowser.md#handle403error)
- [init](ChatGPTAPIBrowser.md#init)
- [resetThread](ChatGPTAPIBrowser.md#resetthread)
- [sendMessage](ChatGPTAPIBrowser.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTAPIBrowser**(`opts`)

Creates a new client wrapper for automating the ChatGPT webapp.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.browserPath?` | `string` | **`Default Value`**  `undefined` * |
| `opts.captchaToken?` | `string` | **`Default Value`**  `undefined` * |
| `opts.debug?` | `boolean` | **`Default Value`**  `false` * |
| `opts.email` | `string` | - |
| `opts.isGoogleLogin?` | `boolean` | **`Default Value`**  `false` * |
| `opts.markdown?` | `boolean` | **`Default Value`**  `true` * |
| `opts.minimize?` | `boolean` | **`Default Value`**  `true` * |
| `opts.password` | `string` | - |

#### Defined in

[src/chatgpt-api-browser.ts:32](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L32)

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

[src/chatgpt-api-browser.ts:153](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L153)

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

[src/chatgpt-api-browser.ts:190](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L190)

___

### close

▸ **close**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:453](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L453)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/chatgpt-api-browser.ts:257](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L257)

___

### handle403Error

▸ **handle403Error**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:238](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L238)

___

### init

▸ **init**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/chatgpt-api-browser.ts:76](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L76)

___

### resetThread

▸ **resetThread**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:445](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L445)

___

### sendMessage

▸ **sendMessage**(`message`, `opts?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/chatgpt-api-browser.ts:330](https://github.com/transitive-bullshit/chatgpt-api/blob/d685b78/src/chatgpt-api-browser.ts#L330)
