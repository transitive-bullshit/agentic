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
| `opts.captchaToken?` | `string` | **`Default Value`**  `undefined` * |
| `opts.debug?` | `boolean` | **`Default Value`**  `false` * |
| `opts.email` | `string` | - |
| `opts.isGoogleLogin?` | `boolean` | **`Default Value`**  `false` * |
| `opts.markdown?` | `boolean` | **`Default Value`**  `true` * |
| `opts.minimize?` | `boolean` | **`Default Value`**  `true` * |
| `opts.password` | `string` | - |

#### Defined in

[src/chatgpt-api-browser.ts:31](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L31)

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

[src/chatgpt-api-browser.ts:142](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L142)

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

[src/chatgpt-api-browser.ts:179](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L179)

___

### close

▸ **close**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:441](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L441)

___

### getIsAuthenticated

▸ **getIsAuthenticated**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/chatgpt-api-browser.ts:246](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L246)

___

### handle403Error

▸ **handle403Error**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:227](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L227)

___

### init

▸ **init**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/chatgpt-api-browser.ts:70](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L70)

___

### resetThread

▸ **resetThread**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chatgpt-api-browser.ts:434](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L434)

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

[src/chatgpt-api-browser.ts:319](https://github.com/transitive-bullshit/chatgpt-api/blob/d27238c/src/chatgpt-api-browser.ts#L319)
