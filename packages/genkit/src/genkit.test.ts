import { EchoAITool } from '@agentic/core'
import { describe, expect, test } from 'vitest'

import { createGenkitTools } from './genkit'

describe('genkit', () => {
  test('createGenkitTools', () => {
    expect(createGenkitTools(new EchoAITool())).toHaveLength(1)
  })
})
