import { EchoAITool } from '@agentic/core'
import { describe, expect, test } from 'vitest'

import { createLangChainTools } from './langchain'

describe('langchain', () => {
  test('createLangChainTools', () => {
    expect(createLangChainTools(new EchoAITool())).toHaveLength(1)
  })
})
