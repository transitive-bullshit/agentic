[chatgpt](../readme.md) / [Exports](../modules.md) / [openai](../modules/openai.md) / CreateChatCompletionDeltaResponse

# Interface: CreateChatCompletionDeltaResponse

[openai](../modules/openai.md).CreateChatCompletionDeltaResponse

## Hierarchy

- **`CreateChatCompletionDeltaResponse`**

  ↳ [`CreateChatCompletionStreamResponse`](CreateChatCompletionStreamResponse.md)

## Table of contents

### Properties

- [choices](openai.CreateChatCompletionDeltaResponse.md#choices)
- [created](openai.CreateChatCompletionDeltaResponse.md#created)
- [id](openai.CreateChatCompletionDeltaResponse.md#id)
- [model](openai.CreateChatCompletionDeltaResponse.md#model)
- [object](openai.CreateChatCompletionDeltaResponse.md#object)

## Properties

### choices

• **choices**: [{ `delta`: { `content?`: `string` ; `role`: [`Role`](../modules.md#role)  } ; `finish_reason`: `string` ; `index`: `number`  }]

#### Defined in

[src/types.ts:198](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L198)

___

### created

• **created**: `number`

#### Defined in

[src/types.ts:196](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L196)

___

### id

• **id**: `string`

#### Defined in

[src/types.ts:194](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L194)

___

### model

• **model**: `string`

#### Defined in

[src/types.ts:197](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L197)

___

### object

• **object**: ``"chat.completion.chunk"``

#### Defined in

[src/types.ts:195](https://github.com/transitive-bullshit/chatgpt-api/blob/bf66500/src/types.ts#L195)
