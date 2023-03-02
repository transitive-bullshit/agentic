[chatgpt](readme.md) / Exports

# chatgpt

## Table of contents

### Namespaces

- [openai](modules/openai.md)

### Classes

- [ChatGPTAPI](classes/ChatGPTAPI.md)
- [ChatGPTError](classes/ChatGPTError.md)
- [ChatGPTUnofficialProxyAPI](classes/ChatGPTUnofficialProxyAPI.md)

### Interfaces

- [ChatMessage](interfaces/ChatMessage.md)

### Type Aliases

- [ContentType](modules.md#contenttype)
- [ConversationJSONBody](modules.md#conversationjsonbody)
- [ConversationResponseEvent](modules.md#conversationresponseevent)
- [FetchFn](modules.md#fetchfn)
- [GetMessageByIdFunction](modules.md#getmessagebyidfunction)
- [Message](modules.md#message)
- [MessageActionType](modules.md#messageactiontype)
- [MessageContent](modules.md#messagecontent)
- [MessageMetadata](modules.md#messagemetadata)
- [Prompt](modules.md#prompt)
- [PromptContent](modules.md#promptcontent)
- [Role](modules.md#role)
- [SendMessageBrowserOptions](modules.md#sendmessagebrowseroptions)
- [SendMessageOptions](modules.md#sendmessageoptions)
- [UpsertMessageFunction](modules.md#upsertmessagefunction)

## Type Aliases

### ContentType

Ƭ **ContentType**: ``"text"``

#### Defined in

[src/types.ts:103](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L103)

___

### ConversationJSONBody

Ƭ **ConversationJSONBody**: `Object`

https://chat.openapi.com/backend-api/conversation

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `action` | `string` | The action to take |
| `conversation_id?` | `string` | The ID of the conversation |
| `messages` | [`Prompt`](modules.md#prompt)[] | Prompts to provide |
| `model` | `string` | The model to use |
| `parent_message_id` | `string` | The parent message ID |

#### Defined in

[src/types.ts:59](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L59)

___

### ConversationResponseEvent

Ƭ **ConversationResponseEvent**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conversation_id?` | `string` |
| `error?` | `string` \| ``null`` |
| `message?` | [`Message`](modules.md#message) |

#### Defined in

[src/types.ts:117](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L117)

___

### FetchFn

Ƭ **FetchFn**: typeof `fetch`

#### Defined in

[src/types.ts:3](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L3)

___

### GetMessageByIdFunction

Ƭ **GetMessageByIdFunction**: (`id`: `string`) => `Promise`<[`ChatMessage`](interfaces/ChatMessage.md)\>

#### Type declaration

▸ (`id`): `Promise`<[`ChatMessage`](interfaces/ChatMessage.md)\>

Returns a chat message from a store by it's ID (or null if not found).

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`Promise`<[`ChatMessage`](interfaces/ChatMessage.md)\>

#### Defined in

[src/types.ts:51](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L51)

___

### Message

Ƭ **Message**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content` | [`MessageContent`](modules.md#messagecontent) |
| `create_time` | `string` \| ``null`` |
| `end_turn` | ``null`` |
| `id` | `string` |
| `metadata` | [`MessageMetadata`](modules.md#messagemetadata) |
| `recipient` | `string` |
| `role` | [`Role`](modules.md#role) |
| `update_time` | `string` \| ``null`` |
| `user` | `string` \| ``null`` |
| `weight` | `number` |

#### Defined in

[src/types.ts:123](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L123)

___

### MessageActionType

Ƭ **MessageActionType**: ``"next"`` \| ``"variant"``

#### Defined in

[src/types.ts:17](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L17)

___

### MessageContent

Ƭ **MessageContent**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content_type` | `string` |
| `parts` | `string`[] |

#### Defined in

[src/types.ts:136](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L136)

___

### MessageMetadata

Ƭ **MessageMetadata**: `any`

#### Defined in

[src/types.ts:141](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L141)

___

### Prompt

Ƭ **Prompt**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `content` | [`PromptContent`](modules.md#promptcontent) | The content of the prompt |
| `id` | `string` | The ID of the prompt |
| `role` | [`Role`](modules.md#role) | The role played in the prompt |

#### Defined in

[src/types.ts:86](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L86)

___

### PromptContent

Ƭ **PromptContent**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `content_type` | [`ContentType`](modules.md#contenttype) | The content type of the prompt |
| `parts` | `string`[] | The parts to the prompt |

#### Defined in

[src/types.ts:105](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L105)

___

### Role

Ƭ **Role**: ``"user"`` \| ``"assistant"`` \| ``"system"``

#### Defined in

[src/types.ts:1](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L1)

___

### SendMessageBrowserOptions

Ƭ **SendMessageBrowserOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `abortSignal?` | `AbortSignal` |
| `action?` | [`MessageActionType`](modules.md#messageactiontype) |
| `conversationId?` | `string` |
| `messageId?` | `string` |
| `onProgress?` | (`partialResponse`: [`ChatMessage`](interfaces/ChatMessage.md)) => `void` |
| `parentMessageId?` | `string` |
| `timeoutMs?` | `number` |

#### Defined in

[src/types.ts:19](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L19)

___

### SendMessageOptions

Ƭ **SendMessageOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `abortSignal?` | `AbortSignal` | - |
| `messageId?` | `string` | - |
| `name?` | `string` | The name of a user in a multi-user chat. |
| `onProgress?` | (`partialResponse`: [`ChatMessage`](interfaces/ChatMessage.md)) => `void` | - |
| `parentMessageId?` | `string` | - |
| `stream?` | `boolean` | - |
| `systemMessage?` | `string` | - |
| `timeoutMs?` | `number` | - |

#### Defined in

[src/types.ts:5](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L5)

___

### UpsertMessageFunction

Ƭ **UpsertMessageFunction**: (`message`: [`ChatMessage`](interfaces/ChatMessage.md)) => `Promise`<`void`\>

#### Type declaration

▸ (`message`): `Promise`<`void`\>

Upserts a chat message to a store.

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | [`ChatMessage`](interfaces/ChatMessage.md) |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/types.ts:54](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L54)
