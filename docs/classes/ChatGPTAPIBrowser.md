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
- [getLastMessage](ChatGPTAPIBrowser.md#getlastmessage)
- [getMessages](ChatGPTAPIBrowser.md#getmessages)
- [getPrompts](ChatGPTAPIBrowser.md#getprompts)
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
| `opts.captchaToken?` | `string` | - |
| `opts.debug?` | `boolean` | **`Default Value`**  `false` * |
| `opts.email` | `string` | - |
| `opts.isGoogleLogin?` | `boolean` | - |
| `opts.markdown?` | `boolean` | **`Default Value`**  `true` * |
| `opts.password` | `string` | - |

#### Defined in

[src/chatgpt-api-browser.ts:24](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L24)

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

[src/chatgpt-api-browser.ts:125](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L125)

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

[src/chatgpt-api-browser.ts:162](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L162)

___

### close

▸ **close**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:352](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L352)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/chatgpt-api-browser.ts:221](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L221)

___

### getLastMessage

▸ **getLastMessage**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/chatgpt-api-browser.ts:231](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L231)

___

### getMessages

▸ **getMessages**(): `Promise`<`string`[]\>

#### Returns

`Promise`<`string`[]\>

#### Defined in

[src/chatgpt-api-browser.ts:251](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L251)

___

### getPrompts

▸ **getPrompts**(): `Promise`<`string`[]\>

#### Returns

`Promise`<`string`[]\>

#### Defined in

[src/chatgpt-api-browser.ts:241](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L241)

___

### handle403Error

▸ **handle403Error**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:204](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L204)

___

### init

▸ **init**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/chatgpt-api-browser.ts:55](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L55)

___

### resetThread

▸ **resetThread**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:345](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L345)

___

### sendMessage

▸ **sendMessage**(`message`, `opts?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `opts` | `Object` |
| `opts.timeoutMs?` | `number` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/chatgpt-api-browser.ts:291](https://github.com/transitive-bullshit/chatgpt-api/blob/16d1699/src/chatgpt-api-browser.ts#L291)
