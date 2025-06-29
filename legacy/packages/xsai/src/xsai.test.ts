import { EchoAITool } from '@agentic/core'
import { expect, test } from 'vitest'

import { createXSAITools, createXSAIToolsFromIdentifier } from './xsai'

test('createXSAITools', async () => {
  const tools = await createXSAITools(new EchoAITool())
  expect(tools).toHaveLength(1)
  expect(tools[0]!.function.name).toBe('echo')
})

test('createXSAIToolsFromIdentifier', async () => {
  const tools = await createXSAIToolsFromIdentifier('@agentic/search')
  expect(tools).toHaveLength(1)
  expect(tools[0]!.function.name).toBe('search')
})
