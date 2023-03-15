[chatgpt](../readme.md) / [Exports](../modules.md) / ChatGPTAPI

# Class: ChatGPTAPI

## Table of contents

### Constructors

- [constructor](ChatGPTAPI.md#constructor)

### Accessors

- [apiKey](ChatGPTAPI.md#apikey)

### Methods

- [sendMessage](ChatGPTAPI.md#sendmessage)

## Constructors

### constructor

• **new ChatGPTAPI**(`opts`)

Creates a new client wrapper around OpenAI's chat completion API, mimicing the official ChatGPT webapp's functionality as closely as possible.

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`ChatGPTAPIOptions`](../modules.md#chatgptapioptions) |

#### Defined in

[src/chatgpt-api.ts:49](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/chatgpt-api.ts#L49)

## Accessors

### apiKey

• `get` **apiKey**(): `string`

#### Returns

`string`

#### Defined in

[src/chatgpt-api.ts:308](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/chatgpt-api.ts#L308)

• `set` **apiKey**(`apiKey`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `apiKey` | `string` |

#### Returns

`void`

#### Defined in

[src/chatgpt-api.ts:312](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/chatgpt-api.ts#L312)

## Methods

### sendMessage

▸ **sendMessage**(`text`, `opts?`): `Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

Sends a message to the OpenAI chat completions endpoint, waits for the response
to resolve, and returns the response.

If you want your response to have historical context, you must provide a valid `parentMessageId`.

If you want to receive a stream of partial responses, use `opts.onProgress`.

Set `debug: true` in the `ChatGPTAPI` constructor to log more info on the full prompt sent to the OpenAI chat completions API. You can override the `systemMessage` in `opts` to customize the assistant's instructions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `opts` | [`SendMessageOptions`](../modules.md#sendmessageoptions) |

#### Returns

`Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

The response from ChatGPT

#### Defined in

[src/chatgpt-api.ts:131](https://github.com/transitive-bullshit/chatgpt-api/blob/c4ffe53/src/chatgpt-api.ts#L131)
