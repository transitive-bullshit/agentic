[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

### Methods

- [close](ChatGPTAPI.md#close)
- [getIsSignedIn](ChatGPTAPI.md#getissignedin)
- [getLastMessage](ChatGPTAPI.md#getlastmessage)
- [getMessages](ChatGPTAPI.md#getmessages)
- [getPrompts](ChatGPTAPI.md#getprompts)
- [init](ChatGPTAPI.md#init)
- [sendMessage](ChatGPTAPI.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTAPI**(`opts?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.chatUrl?` | `string` | **`Default Value`**  `'https://chat.openai.com/'` * |
| `opts.headless?` | `boolean` | **`Default Value`**  `false` * |
| `opts.markdown?` | `boolean` | **`Default Value`**  `true` * |
| `opts.userDataDir?` | `string` | **`Default Value`**  `'/tmp/chatgpt'` * |

#### Defined in

chatgpt-api.ts:20

## Methods

### close

▸ **close**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

chatgpt-api.ts:175

___

### getIsSignedIn

▸ **getIsSignedIn**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

chatgpt-api.ts:88

___

### getLastMessage

▸ **getLastMessage**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

chatgpt-api.ts:93

___

### getMessages

▸ **getMessages**(): `Promise`<`string`[]\>

#### Returns

`Promise`<`string`[]\>

#### Defined in

chatgpt-api.ts:113

___

### getPrompts

▸ **getPrompts**(): `Promise`<`string`[]\>

#### Returns

`Promise`<`string`[]\>

#### Defined in

chatgpt-api.ts:103

___

### init

▸ **init**(`opts?`): `Promise`<`Page`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.auth?` | ``"blocking"`` \| ``"eager"`` |

#### Returns

`Promise`<`Page`\>

#### Defined in

chatgpt-api.ts:48

___

### sendMessage

▸ **sendMessage**(`message`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

chatgpt-api.ts:151
