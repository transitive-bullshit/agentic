import { EchoAITool } from '@agentic/core'
import { expect, test } from 'vitest'

import { createMastraTools, createMastraToolsFromIdentifier } from './mastra'

test('createMastraTools', () => {
  expect(createMastraTools(new EchoAITool())).toHaveProperty('echo')
})

test('createMastraToolsFromIdentifier', async () => {
  const tools = await createMastraToolsFromIdentifier('@agentic/search')
  expect(tools).toHaveProperty('search')
})
