[chatgpt](../readme.md) / [Exports](../modules.md) / openai

# Namespace: openai

## Table of contents

### Interfaces

- [ChatCompletionRequestMessage](../interfaces/openai.ChatCompletionRequestMessage.md)
- [ChatCompletionResponseMessage](../interfaces/openai.ChatCompletionResponseMessage.md)
- [CreateChatCompletionDeltaResponse](../interfaces/openai.CreateChatCompletionDeltaResponse.md)
- [CreateChatCompletionRequest](../interfaces/openai.CreateChatCompletionRequest.md)
- [CreateChatCompletionResponse](../interfaces/openai.CreateChatCompletionResponse.md)
- [CreateChatCompletionResponseChoicesInner](../interfaces/openai.CreateChatCompletionResponseChoicesInner.md)
- [CreateCompletionResponseUsage](../interfaces/openai.CreateCompletionResponseUsage.md)

### Type Aliases

- [ChatCompletionRequestMessageRoleEnum](openai.md#chatcompletionrequestmessageroleenum)
- [ChatCompletionResponseMessageRoleEnum](openai.md#chatcompletionresponsemessageroleenum)
- [CreateChatCompletionRequestStop](openai.md#createchatcompletionrequeststop)

### Variables

- [ChatCompletionRequestMessageRoleEnum](openai.md#chatcompletionrequestmessageroleenum-1)
- [ChatCompletionResponseMessageRoleEnum](openai.md#chatcompletionresponsemessageroleenum-1)

## Type Aliases

### ChatCompletionRequestMessageRoleEnum

Ƭ **ChatCompletionRequestMessageRoleEnum**: typeof [`ChatCompletionRequestMessageRoleEnum`](openai.md#chatcompletionrequestmessageroleenum-1)[keyof typeof [`ChatCompletionRequestMessageRoleEnum`](openai.md#chatcompletionrequestmessageroleenum-1)]

#### Defined in

[src/types.ts:186](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L186)

[src/types.ts:191](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L191)

___

### ChatCompletionResponseMessageRoleEnum

Ƭ **ChatCompletionResponseMessageRoleEnum**: typeof [`ChatCompletionResponseMessageRoleEnum`](openai.md#chatcompletionresponsemessageroleenum-1)[keyof typeof [`ChatCompletionResponseMessageRoleEnum`](openai.md#chatcompletionresponsemessageroleenum-1)]

#### Defined in

[src/types.ts:212](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L212)

[src/types.ts:217](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L217)

___

### CreateChatCompletionRequestStop

Ƭ **CreateChatCompletionRequestStop**: `string`[] \| `string`

**`Export`**

#### Defined in

[src/types.ts:303](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L303)

## Variables

### ChatCompletionRequestMessageRoleEnum

• `Const` **ChatCompletionRequestMessageRoleEnum**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Assistant` | ``"assistant"`` |
| `System` | ``"system"`` |
| `User` | ``"user"`` |

#### Defined in

[src/types.ts:186](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L186)

[src/types.ts:191](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L191)

___

### ChatCompletionResponseMessageRoleEnum

• `Const` **ChatCompletionResponseMessageRoleEnum**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Assistant` | ``"assistant"`` |
| `System` | ``"system"`` |
| `User` | ``"user"`` |

#### Defined in

[src/types.ts:212](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L212)

[src/types.ts:217](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L217)
