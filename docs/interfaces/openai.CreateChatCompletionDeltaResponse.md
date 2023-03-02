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

[src/types.ts:149](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L149)

___

### created

• **created**: `number`

#### Defined in

[src/types.ts:147](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L147)

___

### id

• **id**: `string`

#### Defined in

[src/types.ts:145](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L145)

___

### model

• **model**: `string`

#### Defined in

[src/types.ts:148](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L148)

___

### object

• **object**: ``"chat.completion.chunk"``

#### Defined in

[src/types.ts:146](https://github.com/transitive-bullshit/chatgpt-api/blob/1e4ddd6/src/types.ts#L146)
