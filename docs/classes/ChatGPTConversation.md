[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTConversation

# Class: ChatGPTConversation

A conversation wrapper around the ChatGPTAPI. This allows you to send
multiple messages to ChatGPT and receive responses, without having to
manually pass the conversation ID and parent message ID for each message.

## Table of contents

### Constructors

- [constructor](ChatGPTConversation.md#constructor)

### Properties

- [api](ChatGPTConversation.md#api)
- [conversationId](ChatGPTConversation.md#conversationid)
- [parentMessageId](ChatGPTConversation.md#parentmessageid)

### Methods

- [sendMessage](ChatGPTConversation.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTConversation**(`api`, `opts?`)

Creates a new conversation wrapper around the ChatGPT API.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `api` | [`ChatGPTAPI`](ChatGPTAPI.md) | The ChatGPT API instance to use |
| `opts` | `Object` | - |
| `opts.conversationId?` | `string` | Optional ID of a conversation to continue |
| `opts.parentMessageId?` | `string` | Optional ID of the previous message in the conversation |

#### Defined in

[src/chatgpt-conversation.ts:21](https://github.com/transitive-bullshit/chatgpt-api/blob/c257286/src/chatgpt-conversation.ts#L21)

## Properties

### api

• **api**: [`ChatGPTAPI`](ChatGPTAPI.md)

#### Defined in

[src/chatgpt-conversation.ts:10](https://github.com/transitive-bullshit/chatgpt-api/blob/c257286/src/chatgpt-conversation.ts#L10)

___

### conversationId

• **conversationId**: `string` = `undefined`

#### Defined in

[src/chatgpt-conversation.ts:11](https://github.com/transitive-bullshit/chatgpt-api/blob/c257286/src/chatgpt-conversation.ts#L11)

___

### parentMessageId

• **parentMessageId**: `string` = `undefined`

#### Defined in

[src/chatgpt-conversation.ts:12](https://github.com/transitive-bullshit/chatgpt-api/blob/c257286/src/chatgpt-conversation.ts#L12)

## Methods

### sendMessage

▸ **sendMessage**(`message`, `opts?`): `Promise`<`string`\>

Sends a message to ChatGPT, waits for the response to resolve, and returns
the response.

If this is the first message in the conversation, the conversation ID and
parent message ID will be automatically set.

This allows you to send multiple messages to ChatGPT and receive responses,
without having to manually pass the conversation ID and parent message ID
for each message.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | The prompt message to send |
| `opts` | [`SendConversationMessageOptions`](../modules.md#sendconversationmessageoptions) | - |

#### Returns

`Promise`<`string`\>

The response from ChatGPT

#### Defined in

[src/chatgpt-conversation.ts:48](https://github.com/transitive-bullshit/chatgpt-api/blob/c257286/src/chatgpt-conversation.ts#L48)
