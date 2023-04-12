[chatgpt](../readme.md) / [Exports](../modules.md) / CreateChatCompletionStreamResponse

# Interface: CreateChatCompletionStreamResponse

## Hierarchy

- [`CreateChatCompletionDeltaResponse`](openai.CreateChatCompletionDeltaResponse.md)

  ↳ **`CreateChatCompletionStreamResponse`**

## Table of contents

### Properties

- [choices](CreateChatCompletionStreamResponse.md#choices)
- [created](CreateChatCompletionStreamResponse.md#created)
- [id](CreateChatCompletionStreamResponse.md#id)
- [model](CreateChatCompletionStreamResponse.md#model)
- [object](CreateChatCompletionStreamResponse.md#object)
- [usage](CreateChatCompletionStreamResponse.md#usage)

## Properties

### choices

• **choices**: [{ `delta`: { `content?`: `string` ; `role`: [`Role`](../modules.md#role)  } ; `finish_reason`: `string` ; `index`: `number`  }]

#### Inherited from

[CreateChatCompletionDeltaResponse](openai.CreateChatCompletionDeltaResponse.md).[choices](openai.CreateChatCompletionDeltaResponse.md#choices)

#### Defined in

[src/types.ts:198](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L198)

___

### created

• **created**: `number`

#### Inherited from

[CreateChatCompletionDeltaResponse](openai.CreateChatCompletionDeltaResponse.md).[created](openai.CreateChatCompletionDeltaResponse.md#created)

#### Defined in

[src/types.ts:196](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L196)

___

### id

• **id**: `string`

#### Inherited from

[CreateChatCompletionDeltaResponse](openai.CreateChatCompletionDeltaResponse.md).[id](openai.CreateChatCompletionDeltaResponse.md#id)

#### Defined in

[src/types.ts:194](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L194)

___

### model

• **model**: `string`

#### Inherited from

[CreateChatCompletionDeltaResponse](openai.CreateChatCompletionDeltaResponse.md).[model](openai.CreateChatCompletionDeltaResponse.md#model)

#### Defined in

[src/types.ts:197](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L197)

___

### object

• **object**: ``"chat.completion.chunk"``

#### Inherited from

[CreateChatCompletionDeltaResponse](openai.CreateChatCompletionDeltaResponse.md).[object](openai.CreateChatCompletionDeltaResponse.md#object)

#### Defined in

[src/types.ts:195](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L195)

___

### usage

• **usage**: [`CreateCompletionStreamResponseUsage`](CreateCompletionStreamResponseUsage.md)

#### Defined in

[src/types.ts:97](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L97)
