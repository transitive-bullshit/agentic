import { EchoAITool } from '@agentic/core'
import { describe, expect, test } from 'vitest'

import { createAISDKTools } from './ai-sdk'

describe('ai-sdk', () => {
  test('createAISDKTools', () => {
    expect(createAISDKTools(new EchoAITool())).toHaveProperty('echo')
  })
})
