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

[src/types.ts:219](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L219)

[src/types.ts:224](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L224)

___

### ChatCompletionResponseMessageRoleEnum

Ƭ **ChatCompletionResponseMessageRoleEnum**: typeof [`ChatCompletionResponseMessageRoleEnum`](openai.md#chatcompletionresponsemessageroleenum-1)[keyof typeof [`ChatCompletionResponseMessageRoleEnum`](openai.md#chatcompletionresponsemessageroleenum-1)]

#### Defined in

[src/types.ts:245](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L245)

[src/types.ts:250](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L250)

___

### CreateChatCompletionRequestStop

Ƭ **CreateChatCompletionRequestStop**: `string`[] \| `string`

**`Export`**

#### Defined in

[src/types.ts:336](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L336)

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

[src/types.ts:219](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L219)

[src/types.ts:224](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L224)

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

[src/types.ts:245](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L245)

[src/types.ts:250](https://github.com/transitive-bullshit/chatgpt-api/blob/9eac18f/src/types.ts#L250)
