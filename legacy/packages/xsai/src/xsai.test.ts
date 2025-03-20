import { EchoAITool } from '@agentic/core'
import { describe, expect, test } from 'vitest'

import { createXSAISDKTools } from './xsai'

describe('xsai', () => {
  test('createXSAISDKTools', async () => {
    const tools = await createXSAISDKTools(new EchoAITool())
    expect(tools).toHaveLength(1)
    expect(tools[0]!.function.name).toBe('echo')
  })
})
