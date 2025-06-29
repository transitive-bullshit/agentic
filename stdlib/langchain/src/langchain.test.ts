import { EchoAITool } from '@agentic/core'
import { expect, test } from 'vitest'

import {
  createLangChainTools,
  createLangChainToolsFromIdentifier
} from './langchain'

test('createLangChainTools', () => {
  expect(createLangChainTools(new EchoAITool())).toHaveLength(1)
})

test('createLangChainToolsFromIdentifier', async () => {
  const tools = await createLangChainToolsFromIdentifier('@agentic/search')
  expect(tools).toHaveLength(1)
  expect(tools[0]!.name).toBe('search')
})
