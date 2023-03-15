[chatgpt](../readme.md) / [Exports](../modules.md) / [openai](../modules/openai.md) / CreateChatCompletionDeltaResponse

# Interface: CreateChatCompletionDeltaResponse

[openai](../modules/openai.md).CreateChatCompletionDeltaResponse

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

[src/types.ts:179](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/types.ts#L179)

___

### created

• **created**: `number`

#### Defined in

[src/types.ts:177](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/types.ts#L177)

___

### id

• **id**: `string`

#### Defined in

[src/types.ts:175](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/types.ts#L175)

___

### model

• **model**: `string`

#### Defined in

[src/types.ts:178](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/types.ts#L178)

___

### object

• **object**: ``"chat.completion.chunk"``

#### Defined in

[src/types.ts:176](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/types.ts#L176)
