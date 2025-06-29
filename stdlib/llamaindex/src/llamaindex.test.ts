import { EchoAITool } from '@agentic/core'
import { expect, test } from 'vitest'

import {
  createLlamaIndexTools,
  createLlamaIndexToolsFromIdentifier
} from './llamaindex'

test('createLlamaIndexTools', () => {
  expect(createLlamaIndexTools(new EchoAITool())).toHaveLength(1)
})

test('createLlamaIndexToolsFromIdentifier', async () => {
  const tools = await createLlamaIndexToolsFromIdentifier('@agentic/search')
  expect(tools).toHaveLength(1)
  expect(tools[0]!.metadata.name).toBe('search')
})
