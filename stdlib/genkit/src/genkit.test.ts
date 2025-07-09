import { EchoAITool } from '@agentic/core'
import { Genkit } from 'genkit'
import { expect, test } from 'vitest'

import { createGenkitTools, createGenkitToolsFromIdentifier } from './genkit'

test('createGenkitTools', () => {
  const genkit = new Genkit()
  expect(createGenkitTools(genkit, new EchoAITool())).toHaveLength(1)
})

test(
  'createGenkitToolsFromIdentifier',
  {
    timeout: 30_000
  },
  async () => {
    const genkit = new Genkit()
    const tools = await createGenkitToolsFromIdentifier(
      genkit,
      '@agentic/search'
    )
    expect(tools).toHaveLength(1)
    expect(tools[0]!.__action.name).toBe('search')
  }
)
