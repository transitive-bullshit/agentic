import { EchoAITool } from '@agentic/core'
import { describe, expect, test } from 'vitest'

import { createXSAITools } from './xsai'

describe('xsai', () => {
  test('createXSAITools', async () => {
    const tools = await createXSAITools(new EchoAITool())
    expect(tools).toHaveLength(1)
    expect(tools[0]!.function.name).toBe('echo')
  })
})
