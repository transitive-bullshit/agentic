import { EchoAITool } from '@agentic/core'
import { expect, test } from 'vitest'

import { createAISDKTools, createAISDKToolsFromIdentifier } from './ai-sdk'

test('createAISDKTools', () => {
  expect(createAISDKTools(new EchoAITool())).toHaveProperty('echo')
})

test('createAISDKToolsFromIdentifier', async () => {
  await expect(
    createAISDKToolsFromIdentifier('@agentic/search')
  ).resolves.toHaveProperty('search')
})
