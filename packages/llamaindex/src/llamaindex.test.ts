import { EchoAITool } from '@agentic/core'
import { describe, expect, test } from 'vitest'

import { createLlamaIndexTools } from './llamaindex'

describe('llamaindex', () => {
  test('createLlamaIndexTools', () => {
    expect(createLlamaIndexTools(new EchoAITool())).toHaveLength(1)
  })
})
