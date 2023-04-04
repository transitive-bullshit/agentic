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
- [CreateChatCompletionStreamResponse](interfaces/CreateChatCompletionStreamResponse.md)
- [CreateCompletionStreamResponseUsage](interfaces/CreateCompletionStreamResponseUsage.md)

### Type Aliases

- [ChatGPTAPIOptions](modules.md#chatgptapioptions)
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

### ChatGPTAPIOptions

Ƭ **ChatGPTAPIOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `apiBaseUrl?` | `string` | **`Default Value`** `'https://api.openai.com'` * |
| `apiKey` | `string` | - |
| `apiOrg?` | `string` | - |
| `completionParams?` | `Partial`<`Omit`<[`CreateChatCompletionRequest`](interfaces/openai.CreateChatCompletionRequest.md), ``"messages"`` \| ``"n"`` \| ``"stream"``\>\> | - |
| `debug?` | `boolean` | **`Default Value`** `false` * |
| `fetch?` | [`FetchFn`](modules.md#fetchfn) | - |
| `getMessageById?` | [`GetMessageByIdFunction`](modules.md#getmessagebyidfunction) | - |
| `maxModelTokens?` | `number` | **`Default Value`** `4096` * |
| `maxResponseTokens?` | `number` | **`Default Value`** `1000` * |
| `messageStore?` | `Keyv` | - |
| `systemMessage?` | `string` | - |
| `upsertMessage?` | [`UpsertMessageFunction`](modules.md#upsertmessagefunction) | - |

#### Defined in

[src/types.ts:7](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L7)

___

### ContentType

Ƭ **ContentType**: ``"text"``

#### Defined in

[src/types.ts:152](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L152)

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

[src/types.ts:108](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L108)

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

[src/types.ts:166](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L166)

___

### FetchFn

Ƭ **FetchFn**: typeof `fetch`

#### Defined in

[src/types.ts:5](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L5)

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

[src/types.ts:90](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L90)

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

[src/types.ts:172](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L172)

___

### MessageActionType

Ƭ **MessageActionType**: ``"next"`` \| ``"variant"``

#### Defined in

[src/types.ts:53](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L53)

___

### MessageContent

Ƭ **MessageContent**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content_type` | `string` |
| `parts` | `string`[] |

#### Defined in

[src/types.ts:185](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L185)

___

### MessageMetadata

Ƭ **MessageMetadata**: `any`

#### Defined in

[src/types.ts:190](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L190)

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

[src/types.ts:135](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L135)

___

### PromptContent

Ƭ **PromptContent**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `content_type` | [`ContentType`](modules.md#contenttype) | The content type of the prompt |
| `parts` | `string`[] | The parts to the prompt |

#### Defined in

[src/types.ts:154](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L154)

___

### Role

Ƭ **Role**: ``"user"`` \| ``"assistant"`` \| ``"system"``

#### Defined in

[src/types.ts:3](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L3)

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

[src/types.ts:55](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L55)

___

### SendMessageOptions

Ƭ **SendMessageOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `abortSignal?` | `AbortSignal` | - |
| `completionParams?` | `Partial`<`Omit`<[`CreateChatCompletionRequest`](interfaces/openai.CreateChatCompletionRequest.md), ``"messages"`` \| ``"n"`` \| ``"stream"``\>\> | - |
| `conversationId?` | `string` | - |
| `messageId?` | `string` | - |
| `name?` | `string` | The name of a user in a multi-user chat. |
| `onProgress?` | (`partialResponse`: [`ChatMessage`](interfaces/ChatMessage.md)) => `void` | - |
| `parentMessageId?` | `string` | - |
| `stream?` | `boolean` | - |
| `systemMessage?` | `string` | - |
| `timeoutMs?` | `number` | - |

#### Defined in

[src/types.ts:37](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L37)

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

[src/types.ts:93](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L93)
