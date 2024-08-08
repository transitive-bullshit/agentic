import type * as OpenAI from 'openai-fetch'
import { describe, expect, expectTypeOf, test } from 'vitest'

import type * as types from './types'
import { Msg } from './message'

describe('Msg', () => {
  test('creates a message and fixes indentation', () => {
    const msgContent = `
      Hello, World!
    `
    const msg = Msg.system(msgContent)
    expect(msg.role).toEqual('system')
    expect(msg.content).toEqual('Hello, World!')
  })

  test('supports disabling indentation fixing', () => {
    const msgContent = `
      Hello, World!
    `
    const msg = Msg.system(msgContent, { cleanContent: false })
    expect(msg.content).toEqual('\n      Hello, World!\n    ')
  })

  test('handles tool calls request', () => {
    const msg = Msg.toolCall([
      {
        id: 'fake-tool-call-id',
        type: 'function',
        function: {
          arguments: '{"prompt": "Hello, World!"}',
          name: 'hello'
        }
      }
    ])
    expectTypeOf(msg).toMatchTypeOf<types.Msg.ToolCall>()
    expect(Msg.isToolCall(msg)).toBe(true)
  })

  test('handles tool call response', () => {
    const msg = Msg.toolResult('Hello, World!', 'fake-tool-call-id')
    expectTypeOf(msg).toMatchTypeOf<types.Msg.ToolResult>()
    expect(Msg.isToolResult(msg)).toBe(true)
  })

  test('prompt message types should interop with openai-fetch message types', () => {
    expectTypeOf({} as OpenAI.ChatMessage).toMatchTypeOf<types.Msg>()
    expectTypeOf({} as types.Msg).toMatchTypeOf<OpenAI.ChatMessage>()
    expectTypeOf({} as types.Msg.System).toMatchTypeOf<OpenAI.ChatMessage>()
    expectTypeOf({} as types.Msg.User).toMatchTypeOf<OpenAI.ChatMessage>()
    expectTypeOf({} as types.Msg.Assistant).toMatchTypeOf<OpenAI.ChatMessage>()
    expectTypeOf({} as types.Msg.FuncCall).toMatchTypeOf<OpenAI.ChatMessage>()
    expectTypeOf({} as types.Msg.FuncResult).toMatchTypeOf<OpenAI.ChatMessage>()
  })
})
