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

[chatgpt-api.ts:20](https://github.com/transitive-bullshit/chatgpt-api/blob/ddd9545/src/chatgpt-api.ts#L20)

## Methods

### close

▸ **close**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[chatgpt-api.ts:186](https://github.com/transitive-bullshit/chatgpt-api/blob/ddd9545/src/chatgpt-api.ts#L186)

___

### getIsSignedIn

▸ **getIsSignedIn**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Defined in

[chatgpt-api.ts:94](https://github.com/transitive-bullshit/chatgpt-api/blob/ddd9545/src/chatgpt-api.ts#L94)

___

### getLastMessage

▸ **getLastMessage**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[chatgpt-api.ts:104](https://github.com/transitive-bullshit/chatgpt-api/blob/ddd9545/src/chatgpt-api.ts#L104)

___

### getMessages

▸ **getMessages**(): `Promise`<`string`[]\>

#### Returns

`Promise`<`string`[]\>

#### Defined in

[chatgpt-api.ts:124](https://github.com/transitive-bullshit/chatgpt-api/blob/ddd9545/src/chatgpt-api.ts#L124)

___

### getPrompts

▸ **getPrompts**(): `Promise`<`string`[]\>

#### Returns

`Promise`<`string`[]\>

#### Defined in

[chatgpt-api.ts:114](https://github.com/transitive-bullshit/chatgpt-api/blob/ddd9545/src/chatgpt-api.ts#L114)

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

[chatgpt-api.ts:48](https://github.com/transitive-bullshit/chatgpt-api/blob/ddd9545/src/chatgpt-api.ts#L48)

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

[chatgpt-api.ts:162](https://github.com/transitive-bullshit/chatgpt-api/blob/ddd9545/src/chatgpt-api.ts#L162)
