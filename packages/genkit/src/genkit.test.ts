import { EchoAITool } from '@agentic/core'
import { Genkit } from 'genkit'
import { describe, expect, test } from 'vitest'

import { createGenkitTools } from './genkit'

describe('genkit', () => {
  test('createGenkitTools', () => {
    const genkit = new Genkit()
    expect(createGenkitTools(genkit, new EchoAITool())).toHaveLength(1)
  })
})
